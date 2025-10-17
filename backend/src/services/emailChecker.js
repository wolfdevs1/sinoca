const imap = require("imap-simple");
const { simpleParser } = require("mailparser");
const Transfer = require('../models/Transfer');
const Account = require('../models/Account');

/* ========= Regex y helpers ========= */
// Monto genérico (para fallbacks)
const AMOUNT_RE =
    /(?:\$?\s*)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?)(?=\s*(?:ARS|$))/i;

// Ripio: “Ya tenés/tenes en tu cuenta … ARS”
const RIPIO_LINE_RE =
    /ya ten(?:e|é)s\s+en\s+tu\s+cuenta\b[\s\S]*?(?:\$?\s*)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?)\s*(?:ARS)?/i;

function stripHtml(html = "") {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function firstNonEmptyLine(text = "") {
    return text.replace(/\r/g, "").split("\n").find(l => l.trim())?.trim() || "";
}

function detectProvider(parsedEmail, firstLine, headersText) {
    const low = s => (s || "").toLowerCase();
    const from = low(parsedEmail.from?.text);
    const subj = low(parsedEmail.subject);
    const first = low(firstLine);
    const head = low(headersText);

    if ([from, subj, first, head].some(s => s.includes("ripio"))) return "ripio";
    if ([from, subj, first, head].some(s => s.includes("claro pay") || s.includes("claropay"))) return "claropay";
    // Si la línea arranca con “ya tenés en tu cuenta…”, asumimos Ripio
    if (/^ya ten(?:e|é)s\s+en\s+tu\s+cuenta/i.test(first)) return "ripio";
    return null;
}

/* ========= Obtener cuentas ========= */
async function getMailAccountsFromDB() {
    try {
        const accounts = await Account.find({}, 'name email password');
        return accounts.map(acc => ({
            name: acc.name,
            email: acc.email,
            imapConfig: {
                imap: {
                    user: acc.email,
                    password: acc.password,
                    host: 'imap.gmail.com',
                    port: 993,
                    tls: true,
                    authTimeout: 30000,
                    tlsOptions: { rejectUnauthorized: false },
                }
            }
        }));
    } catch (err) {
        console.error("Error al obtener cuentas de la DB:", err);
        return [];
    }
}

/* ========= Procesar un correo ========= */
async function checkEmail(account) {
    let connection;
    try {
        connection = await imap.connect(account.imapConfig);
        await connection.openBox("INBOX", { readOnly: false });

        const searchCriteria = ["UNSEEN"]; // sin cambios
        const fetchOptions = {
            bodies: ["HEADER", "TEXT"],
            markSeen: false
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        if (!messages.length) return;

        const latestEmail = messages[messages.length - 1];
        const textPart = latestEmail.parts.find(p => p.which === "TEXT");
        if (!textPart) return;

        const parsedEmail = await simpleParser(textPart.body);
        const bodyText = parsedEmail.text || "";
        const firstLine = firstNonEmptyLine(bodyText);
        const headersTxt = (parsedEmail.headerLines || []).map(h => h.line).join("\n");
        const htmlTxt = parsedEmail.html ? stripHtml(parsedEmail.html) : "";

        // Detectar proveedor
        const provider = detectProvider(parsedEmail, firstLine, headersTxt);

        let amountMatch = null;

        if (provider === "ripio") {
            // *** SOLO aceptar Ripio si aparece “Ya tenés en tu cuenta …” ***
            amountMatch =
                firstLine.match(RIPIO_LINE_RE) ||
                bodyText.match(RIPIO_LINE_RE) ||
                (htmlTxt ? htmlTxt.match(RIPIO_LINE_RE) : null);

            if (!amountMatch) {
                // Si NO aparece la frase clave, no lo consideramos acreditación (evita retiros)
                console.log(`[${account.name}] ripio: sin “Ya tenés en tu cuenta…”, se omite.`);
                return;
            }
        }

        if (provider === "claropay" || (!provider)) {
            // ClaroPay clásico por headers
            const headerRegex = /\$(.*?) en/;
            amountMatch = headersTxt.match(headerRegex)?.[1]
                ? [null, headersTxt.match(headerRegex)[1]]
                : amountMatch;

            // Fallback: por si cambia el formato, buscamos monto en el body/html
            if (!amountMatch) {
                amountMatch = bodyText.match(AMOUNT_RE) || (htmlTxt ? htmlTxt.match(AMOUNT_RE) : null);
            }
        }

        if (!amountMatch) return;

        const montoCrudo = amountMatch[1];
        const data = {
            amount: formatNumber(montoCrudo),
            name: provider || "claropay",
            account: account.name,
            used: false
        };

        console.log(`[${account.name}] ${data.name} acreditación:`, data);
        await Transfer.create(data);

        // Marcar visto para no reprocesar
        await connection.addFlags(latestEmail.attributes.uid, "\\Seen");
        // opcional:
        // await connection.addFlags(latestEmail.attributes.uid, "\\Deleted");
        // await connection.expunge();
    } catch (error) {
        console.error(`[${account.name}] Error`, error);
    } finally {
        if (connection) connection.end();
    }
}

/* ========= Loop principal ========= */
async function checkEmails() {
    while (true) {
        try {
            const mailAccounts = await getMailAccountsFromDB();
            for (const account of mailAccounts) {
                //console.log(account);
                await checkEmail(account);
            }
        } catch (err) {
            console.error('Error en main mail loop:', err);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

/* ========= Helpers numéricos ========= */
function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

function formatNumber(number) {
    let numero = number.replaceAll(',', '.');

    if (numero[numero.length - 3] === '.') {
        numero = setCharAt(numero, numero.length - 3, ',');
    } else if (numero[numero.length - 2] === '.') {
        numero = setCharAt(numero, numero.length - 2, ',');
    }

    // Quitar separadores de miles
    numero = numero.replaceAll('.', '');

    // Si termina en ,00 -> dejar entero (9000 en vez de 9000,00)
    if (numero.endsWith(',00')) {
        numero = numero.slice(0, -3);
    }
    return numero;
}

module.exports = checkEmails;
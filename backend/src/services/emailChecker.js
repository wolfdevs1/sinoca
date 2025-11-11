const imap = require("imap-simple");
const { simpleParser } = require("mailparser");
const Transfer = require('../models/Transfer');
const Account = require('../models/Account');

/* ========= Regex y helpers ========= */
// Monto genérico (fallback)
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
    if (/^ya ten(?:e|é)s\s+en\s+tu\s+cuenta/i.test(first)) return "ripio";
    return null;
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

    // Si termina en ,00 -> dejar entero
    if (numero.endsWith(',00')) {
        numero = numero.slice(0, -3);
    }
    return numero;
}

/* ========= Utilidades adicionales ========= */
function withTimeout(promise, ms, label = "op") {
    let t;
    const timeout = new Promise((_, rej) =>
        t = setTimeout(() => rej(new Error(`Timeout ${label} (${ms}ms)`)), ms)
    );
    return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        connection = await withTimeout(imap.connect(account.imapConfig), 15000, "imap.connect");
        await withTimeout(connection.openBox("INBOX", { readOnly: false }), 10000, "openBox");

        const searchCriteria = ["UNSEEN"];
        const fetchOptions = { bodies: ["HEADER", "TEXT", ""], markSeen: false, struct: true };
        const messages = await withTimeout(connection.search(searchCriteria, fetchOptions), 15000, "search");

        if (!messages.length) return;

        for (const msg of messages) {
            const { uid } = msg.attributes || {};
            const textPart =
                msg.parts?.find(p => p.which === "TEXT") ||
                msg.parts?.find(p => p.which === "") ||
                null;

            if (!textPart) {
                try { if (uid) await connection.addFlags(uid, "\\Seen"); } catch { }
                continue;
            }

            let parsedEmail;
            try {
                parsedEmail = await withTimeout(simpleParser(textPart.body), 15000, "simpleParser");
            } catch {
                parsedEmail = {
                    from: { text: "" },
                    subject: "",
                    text: stripHtml(String(textPart.body || "")),
                    headerLines: [],
                    html: ""
                };
            }

            const bodyText = parsedEmail.text || "";
            const firstLine = firstNonEmptyLine(bodyText);
            const headersTxt = (parsedEmail.headerLines || []).map(h => h.line).join("\n");
            const htmlTxt = parsedEmail.html ? stripHtml(parsedEmail.html) : "";

            const provider = detectProvider(parsedEmail, firstLine, headersTxt);
            let amountMatch = null;

            if (provider === "ripio") {
                amountMatch =
                    firstLine.match(RIPIO_LINE_RE) ||
                    bodyText.match(RIPIO_LINE_RE) ||
                    (htmlTxt ? htmlTxt.match(RIPIO_LINE_RE) : null);

                if (!amountMatch) {
                    console.log(`[${account.name}] ripio: sin “Ya tenés en tu cuenta…”, se omite.`);
                    try { if (uid) await connection.addFlags(uid, "\\Seen"); } catch { }
                    continue;
                }
            }

            if (provider === "claropay" || (!provider)) {
                const headerRegex = /\$(.*?) en/;
                const hdr = headersTxt.match(headerRegex);
                amountMatch = hdr?.[1] ? [null, hdr[1]] : null;

                if (!amountMatch) {
                    amountMatch = bodyText.match(AMOUNT_RE) || (htmlTxt ? htmlTxt.match(AMOUNT_RE) : null);
                }
            }

            if (!amountMatch) {
                try { if (uid) await connection.addFlags(uid, "\\Seen"); } catch { }
                continue;
            }

            const montoCrudo = amountMatch[1];
            const data = {
                amount: formatNumber(montoCrudo),
                name: provider || "claropay",
                account: account.name,
                used: false
            };

            console.log(`[${account.name}] ${data.name} acreditación:`, data);

            try {
                await withTimeout(Transfer.create(data), 8000, "Transfer.create");
                if (uid) await withTimeout(connection.addFlags(uid, "\\Seen"), 5000, "addFlags");
            } catch (e) {
                console.error(`[${account.name}] Error guardando/flag:`, e);
            }
        }
    } catch (error) {
        console.error(`[${account.name}] Error`, error);
    } finally {
        if (connection) {
            try { await withTimeout(connection.end(), 5000, "connection.end"); } catch { }
        }
    }
}

/* ========= Loop principal ========= */
process.on('unhandledRejection', (r) => {
    console.error('UNHANDLED REJECTION:', r);
});
process.on('uncaughtException', (e) => {
    console.error('UNCAUGHT EXCEPTION:', e);
});

async function checkEmails() {
    while (true) {
        try {
            const mailAccounts = await getMailAccountsFromDB();
            for (const account of mailAccounts) {
                await checkEmail(account);
                await sleep(300 + Math.floor(Math.random() * 300)); // breve pausa entre cuentas
            }
        } catch (err) {
            console.error('Error en main mail loop:', err);
        }
        const base = 10000, jitter = Math.floor(Math.random() * 1500);
        await sleep(base + jitter);
    }
}

/* ========= Export ========= */
module.exports = checkEmails;

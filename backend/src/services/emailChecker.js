const imap = require("imap-simple");
const { simpleParser } = require("mailparser");
const Transfer = require('../models/Transfer');
const Account = require('../models/Account');

// Obtenemos cuentas desde la base de datos
async function getMailAccountsFromDB() {
    try {
        const accounts = await Account.find({}, 'name email password'); // Solo selecciona email y password
        return accounts.map(acc => ({
            name: acc.name, // Opcional: puedes usar acc.name si lo prefieres
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
            },
            lastEmailReaded: 0
        }));
    } catch (err) {
        console.error("Error al obtener cuentas de la DB:", err);
        return [];
    }
}

async function checkEmail(account) {
    let connection;
    try {
        connection = await imap.connect(account.imapConfig);
        await connection.openBox("INBOX", { readOnly: false });

        const searchCriteria = ["UNSEEN"];
        const fetchOptions = {
            bodies: ["HEADER", "TEXT"],
            markSeen: false
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        if (messages.length === 0) {
            connection.end();
            return;
        }

        const latestEmail = messages[messages.length - 1];
        if (!latestEmail || latestEmail.attributes.uid === account.lastEmailReaded) {
            connection.end();
            return;
        }

        account.lastEmailReaded = latestEmail.attributes.uid;

        const textPart = latestEmail.parts.find(part => part.which === "TEXT");
        if (!textPart) {
            console.log(`[${account.name}] No se pudo obtener el contenido del correo.`);
            connection.end();
            return;
        }

        const parsedEmail = await simpleParser(textPart.body);
        const { headerLines } = parsedEmail;
        const allLines = headerLines.map(h => h.line).join('\n');

        const regex = /\$(.*?) en/;
        const match = allLines.match(regex);

        if (match) {
            const monto = match[1];
            let data = {
                amount: formatNumber(monto),
                name: "claropay",
                account: account.name,
                used: false
            };
            console.log(`[${account.name}] Se detectó nueva acreditación:`, data);

            await Transfer.create(data);

            try {
                await connection.deleteMessage(latestEmail.attributes.uid);
            } catch (err) {
                console.error(`[${account.name}] Error al borrar correo:`, err);
            }
        } else {
            //console.log(`[${account.name}] No se encontró coincidencia con la regex.`);
        }

    } catch (error) {
        console.error(`[${account.name}] Error`, error);
    } finally {
        if (connection) connection.end();
    }
}

async function checkEmails() {
    while (true) {
        try {
            const mailAccounts = await getMailAccountsFromDB(); // <- aquí se cargan desde la DB
            for (const account of mailAccounts) {
                await checkEmail(account);
            }
        } catch (err) {
            console.error('Error en main mail loop:', err);
        }
        await new Promise(resolve => setTimeout(resolve, 10000)); // espera 10s
    }
}

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
    return numero.replaceAll('.', '');
}

module.exports = checkEmails;
const imap = require("imap-simple");
const { simpleParser } = require("mailparser");
const Transferencia = require('../models/Transferencia');

/***************************************************
 * MÚLTIPLES CUENTAS DE MAIL
 ***************************************************/

// Aquí puedes agregar tantas cuentas como quieras.
// Ajusta el user, password y demás según tus datos.
const mailAccounts = [
    {
        name: 'albertmerk45',
        imapConfig: {
            imap: {
                user: 'danielaclaropay@gmail.com',   // Tu correo de Gmail
                password: 'itmh isve jeld iwyy', // Contraseña de app
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 30000,
                tlsOptions: { rejectUnauthorized: false },
            }
        },
        lastEmailReaded: 0 // Para registrar el último UID leído
    },
];

/***************************************************
 * checkEmail: Revisa UNA cuenta de correo
 ***************************************************/
async function checkEmail(account) {
    let connection;
    try {
        // Conexión IMAP
        connection = await imap.connect(account.imapConfig);

        // Abrimos bandeja (INBOX)
        await connection.openBox("INBOX", { readOnly: false });

        // Buscar correos no leídos
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

        // Tomamos el último correo del batch
        // (O podrías iterar todos si quisieras)
        const latestEmail = messages[messages.length - 1];
        if (!latestEmail) {
            connection.end();
            return;
        }

        // Verificamos UID para no repetir
        if (latestEmail.attributes.uid === account.lastEmailReaded) {
            connection.end();
            return;
        }

        // Guardamos el UID para no procesar dos veces
        account.lastEmailReaded = latestEmail.attributes.uid;

        // Obtenemos el texto
        const textPart = latestEmail.parts.find(part => part.which === "TEXT");
        if (!textPart) {
            console.log(`[${account.name}] No se pudo obtener el contenido del correo.`);
            connection.end();
            return;
        }

        const parsedEmail = await simpleParser(textPart.body);
        const { headerLines } = parsedEmail;
        const allLines = headerLines.map(h => h.line).join('\n');

        // Ajusta tu lógica de regex aquí:
        // Ejemplo: Regex para "Claro Pay" que tenías
        const regex = /\$(.*?) en/;
        const match = allLines.match(regex);

        if (match) {
            const monto = match[1];
            let data = {
                cantidad: formatNumber(monto),
                nombre: "claropay"
            };
            console.log(`[${account.name}] Se detectó nueva acreditación:`, data);

            // Registramos en la DB
            await Transferencia.create(data);

            // (Opcional) Eliminar el correo del servidor IMAP
            try {
                await connection.deleteMessage(latestEmail.attributes.uid);
                // console.log(`[${account.name}] Correo eliminado del servidor.`);
            } catch (err) {
                console.error(`[${account.name}] Error al borrar correo:`, err);
            }
        } else {
            console.log(`[${account.name}] No se encontró coincidencia con la regex.`);
        }

    } catch (error) {
        console.error(`[${account.name}] Error`, error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

/***************************************************
 * BUCLE PRINCIPAL DE MAIL
 ***************************************************/
async function checkEmails() {
    while (true) {
        try {
            // Revisamos cada cuenta de correo
            for (const account of mailAccounts) {
                await checkEmail(account);
            }
        } catch (err) {
            console.error('Error en main mail loop:', err);
        }
        // Esperamos 10s antes de la siguiente iteración
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
};

module.exports = checkEmails;
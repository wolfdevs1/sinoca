const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const pending = require('./pendingPhones');

let client = null;
let latestQr = null;
let isClientInitializing = false;
let isClientReady = false;

const retryVerified = new Map(); // Map<phone, { interval }>

const initClient = (io) => {
    if (isClientInitializing || isClientReady) return;

    isClientInitializing = true;

    client = new Client({ authStrategy: new LocalAuth() });

    client.on('qr', (qr) => {
        latestQr = qr;
        io.emit('qr', qr);
    });

    client.on('ready', () => {
        latestQr = null;
        isClientInitializing = false;
        isClientReady = true;
        io.emit('ready');
    });

    client.on('disconnected', (reason) => {
        console.log('WhatsApp desconectado:', reason);
        cleanup(io, `⚠️ Desconectado: ${reason}`);
    });

    client.on('message', async (message) => {
        const from = message.from;
        if (pending.has(from)) {
            const { userId, step, name } = pending.get(from);

            const isRegisterStep = ['register', 'new-account', 'login', 'user-exists'].includes(step);
            const isNegative = message.body.trim().toLowerCase() === 'no';

            if (isRegisterStep) {
                if (isNegative) {
                    await message.reply('Acción denegada');
                    pending.remove(from);
                    return;
                }

                let msg = `✅ ¡Número verificado!\n\n📲 Volvé a la web.`;
                if (step === 'new-account') {
                    msg = `✅ ¡Alias registrado con éxito! \n\n📲 Volvé a la web.`;
                } else if (step === 'login') {
                    msg = `✅ ¡Acceso verificado!\n\n📲 Volvé a la web.`;
                }

                await message.reply(msg);
                pending.remove(from);

                if (step === 'user-exists') {
                    emitWithRetry(io, userId, 'user-exists', name, from);
                } else {
                    emitWithRetry(io, userId, 'verified', { ok: true, msg: '¡Número verificado!' }, from);
                }
            }
        }
    });

    client.initialize().catch(err => {
        console.error('Error al iniciar WhatsApp:', err);
        cleanup(io, '❌ Error al iniciar WhatsApp');
    });
};

function emitWithRetry(io, userId, event, payload, phone) {
    let count = 0;
    const MAX_RETRIES = 24;

    const interval = setInterval(() => {
        if (count++ >= MAX_RETRIES) {
            clearInterval(interval);
            retryVerified.delete(phone);
            console.log(`❌ Retry de ${phone} vencido sin confirmación del frontend`);
        } else {
            const currentSockets = Array.from(io.sockets.sockets.values())
                .filter(s => s.handshake.headers['user-id'] === userId);

            const currentSocket = currentSockets.at(-1);

            console.log(`${userId}: 📡 Sockets encontrados: ${currentSockets.length}`);

            if (currentSocket) {
                currentSocket.emit(event, payload);
                console.log(`✅ Evento '${event}' emitido a ${userId}`);
            } else {
                console.log(`⏳ Aún sin socket para ${userId} (intento ${count})`);
            }
        }
    }, 5000);

    retryVerified.set(phone, { interval });
}

const stopClient = async (io) => {
    if (isClientInitializing && !latestQr) return;
    if (client) {
        try {
            await client.destroy();
        } catch (err) {
            console.warn('Error al detener WhatsApp:', err.message);
        }
    }
    cleanup(io, '⛔ WhatsApp detenido por el usuario');
};

const clearSession = async (io) => {
    if (isClientInitializing && !latestQr) return;
    await stopClient(io);
    const deleteFolder = (folderPath) => {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
    };
    deleteFolder(path.join(__dirname, '..', '..', '.wwebjs_auth'));
    deleteFolder(path.join(__dirname, '..', '..', '.wwebjs_cache'));
    if (io) io.emit('disconnected', '🗑 Sesión de WhatsApp eliminada');
};

const cleanup = (io, msg) => {
    client = null;
    isClientInitializing = false;
    isClientReady = false;
    latestQr = null;
    if (io) io.emit('disconnected', msg);
};

const getClientStatus = () => ({ client, isClientReady, isClientInitializing, latestQr });

const sendMessage = async (phone, text) => {
    if (!client || !isClientReady) throw new Error('WhatsApp no está listo');
    return client.sendMessage(phone, text);
};

const acknowledgeVerified = (phone) => {
    const entry = retryVerified.get(phone);
    if (entry) {
        clearInterval(entry.interval);
        retryVerified.delete(phone);
        console.log(`✅ Confirmación recibida desde frontend para ${phone}`);
    }
};

module.exports = {
    initClient,
    stopClient,
    clearSession,
    getClientStatus,
    sendMessage,
    acknowledgeVerified
};

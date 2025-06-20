const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const pending = require('./pendingPhones');

let client = null;
let latestQr = null;
let isClientInitializing = false;
let isClientReady = false;

const initClient = (io) => {
    if (isClientInitializing || isClientReady) return;

    isClientInitializing = true;

    client = new Client({
        authStrategy: new LocalAuth(),
    });

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
            const { socket, step, name } = pending.get(from);
            const isRegisterStep = ['register', 'new-account', 'login', 'user-exists'].includes(step);
            const isNegative = message.body.trim().toLowerCase() === 'no';
            if (isRegisterStep) {
                if (isNegative) {
                    await message.reply('Acción denegada');
                    pending.remove(from);
                    return;
                }
                let msg = `✅ ¡Número verificado!

📲 Volvé a la web.`;
                if (step === 'new-account') {
                    msg = `✅ ¡Alias registrado con éxito! 

📲 Volvé a la web.`;
                } else if (step === 'login') {
                    msg = `✅ ¡Acceso verificado!

📲 Volvé a la web.`;
                }
                await message.reply(msg);
                pending.remove(from);
                if (step === 'user-exists') socket.emit('user-exists', name)
                else socket.emit('verified', { ok: true, msg });
            }
        }
    });

    client.initialize().catch(err => {
        console.error('Error al iniciar WhatsApp:', err);
        cleanup(io, '❌ Error al iniciar WhatsApp');
    });
};

const stopClient = async (io) => {
    if (isClientInitializing && !latestQr) {
        return;
    }

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
    if (isClientInitializing && !latestQr) {
        return;
    }

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

const getClientStatus = () => ({
    client,
    isClientReady,
    isClientInitializing,
    latestQr
});

const sendMessage = async (phone, text) => {
    if (!client || !isClientReady) throw new Error('WhatsApp no está listo');
    return client.sendMessage(phone, text);
};

module.exports = {
    initClient,
    stopClient,
    clearSession,
    getClientStatus,
    sendMessage
};
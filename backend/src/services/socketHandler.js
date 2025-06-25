const client = require('./client');
const pending = require('./pendingPhones');
const User = require('../models/User');

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('received-verified', (phone) => {
            client.acknowledgeVerified(phone);
        });

        socket.on('request-status', () => {
            const { isClientReady, latestQr } = client.getClientStatus();
            if (isClientReady) socket.emit('ready');
            else if (latestQr) socket.emit('qr', latestQr);
            else socket.emit('disconnected', '❌ WhatsApp está apagado o desconectado');
        });

        socket.on('start-whatsapp', () => client.initClient(io));
        socket.on('stop-whatsapp', () => client.stopClient(io));
        socket.on('clear-session', () => client.clearSession(io));

        socket.on('verify', async (name, phone, step, alias, userId, callback) => {
            if (pending.has(phone)) {
                return callback({ ok: false, msg: 'Ya enviamos un mensaje, espera a que expire (5 min).' });
            }

            const timeoutId = setTimeout(async () => {
                if (!pending.has(phone)) return;
                pending.remove(phone);
                console.log(`Pendiente de ${phone} eliminado tras 5 min sin verificar.`);
                try {
                    await client.sendMessage(phone, '⏰ Tiempo expirado. Volvé a solicitar la validación.');
                } catch (err) {
                    console.error('Error enviando mensaje de expiración:', err);
                }
            }, 5 * 60 * 1000);

            let msg = '';
            if (step === 'register') {
                const user = await User.findOne({ phone });
                if (user) {
                    msg = `⚠️ Ya existe un usuario: ${user.name}\n¿Querés iniciar sesión?`;
                    step = 'user-exists';
                    name = user.name;
                } else {
                    msg = '🎰 Registro en el casino\n¿Autorizás este número?';
                }
            } else if (step === 'new-account') {
                msg = `🆕 ¿Agregar el alias *${alias}*?`;
            }

            pending.add(phone, name, userId, step, timeoutId);
            if (msg) await client.sendMessage(phone, msg);

            callback({ ok: true, msg: 'Mensaje de validación enviado. Revisa tu Whatsapp' });
        });

        socket.on('login', async (name, callback) => {
            const user = await User.findOne({ name: new RegExp(`^${name}$`, 'i') });
            if (!user) return callback({ ok: false, msg: 'Usuario inexistente' });

            if (pending.has(user.phone)) {
                return callback({ ok: false, msg: 'Ya enviamos un mensaje, espera a que expire (5 min).' });
            }

            const timeoutId = setTimeout(async () => {
                if (!pending.has(user.phone)) return;
                pending.remove(user.phone);
                console.log(`Pendiente de ${user.phone} eliminado tras 5 min sin verificar.`);
                try {
                    await client.sendMessage(user.phone, '⏰ Tiempo expirado. Volvé a solicitar la validación.');
                } catch (err) {
                    console.error('Error enviando mensaje de expiración:', err);
                }
            }, 5 * 60 * 1000);

            pending.add(user.phone, user.name, socket.handshake.headers['user-id'], 'login', timeoutId);
            await client.sendMessage(user.phone, '🔐 ¿Estás intentando iniciar sesión?');

            callback({ ok: true, msg: 'Mensaje de validación enviado. Revisa tu Whatsapp' });
        });
    });
};

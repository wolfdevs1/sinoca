const client = require('./client');
const pending = require('./pendingPhones');
const User = require('../models/User');

module.exports = (io) => {
    io.on('connection', (socket) => {

        socket.on('verify', async (name, phone, step, callback) => {
            if (pending.has(phone)) {
                return callback({
                    ok: false,
                    msg: 'Ya enviamos un mensaje, espera a que expire (5 min).'
                });
            }

            // Auto-eliminación a los 5 minutos si no confirman
            const timeoutId = setTimeout(async () => {
                if (!pending.has(phone)) return;
                pending.remove(phone);
                console.log(`Pendiente de ${phone} eliminado tras 5 min sin verificar.`);
                try {
                    await client.sendMessage(
                        phone,
                        'Expiró el tiempo de validación. Vuelve a solicitarla si lo deseas.'
                    );
                } catch (err) {
                    console.error('Error enviando mensaje de expiración:', err);
                }
            }, 5 * 60 * 1000);

            // Guardar en pendientes con timeoutId
            pending.add(phone, name, socket, step, timeoutId);

            // Enviar mensaje según el paso
            let msg = '';
            if (step === 'register') {
                msg = 'Te estás intentando registrar en el casino. ¿Autorizas este número?';
            } else if (step === 'new-account') {
                msg = '¿Estas agregando un nuevo alias?';
            }

            if (msg) {
                await client.sendMessage(phone, msg);
            }

            callback({ ok: true, msg: 'Mensaje de validación enviado. Revisa tu Whatsapp' });
        });

        socket.on('login', async (name, callback) => {
            const user = await User.findOne({ name: new RegExp(`^${name}$`, 'i') });
            if (!user) {
                return callback({ ok: false, msg: 'Usuario inexistente' });
            }

            if (pending.has(user.phone)) {
                return callback({
                    ok: false,
                    msg: 'Ya enviamos un mensaje, espera a que expire (5 min).'
                });
            }

            // Auto-eliminación a los 5 minutos si no confirman
            const timeoutId = setTimeout(async () => {
                if (!pending.has(user.phone)) return;
                pending.remove(user.phone);
                console.log(`Pendiente de ${user.phone} eliminado tras 5 min sin verificar.`);
                try {
                    await client.sendMessage(
                        user.phone,
                        'Expiró el tiempo de validación. Vuelve a solicitarla si lo deseas.'
                    );
                } catch (err) {
                    console.error('Error enviando mensaje de expiración:', err);
                }
            }, 5 * 60 * 1000);

            // Guardar en pendientes con timeoutId
            pending.add(user.phone, user.name, socket, 'login', timeoutId);

            await client.sendMessage(user.phone, '¿Estas intentando iniciar sesión?');
            callback({ ok: true, msg: 'Mensaje de validación enviado.' });
        });

    });
};
const client = require('./client');
const pending = require('./pendingPhones');

module.exports = (io) => {
    io.on('connection', (socket) => {
        // Ahora el evento recibe: usuario, teléfono y callback
        socket.on('verify', async (name, phone, callback) => {
            if (pending.has(phone)) {
                return callback({
                    ok: false,
                    msg: 'Ya enviamos un mensaje, espera a que expire (5 min).'
                });
            }
            // Guardamos el teléfono, el usuario y el socket
            pending.add(phone, name, socket, 'register');
            // Auto-eliminación a los 5 minutos si no confirman
            setTimeout(async () => {
                // Si ya no está en pendientes, salir
                if (!pending.has(phone)) return;
                // Ahí sí removemos y enviamos aviso de expirado
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
            await client.sendMessage(
                phone,
                'Te estás intentando registrar en el casino. ¿Autorizas este número?'
            );
            callback({ ok: true, msg: 'Mensaje de validación enviado.' });
        });
    });
};
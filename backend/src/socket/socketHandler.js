// socketHandler/socketHandler.js
// ------------------------------
// Ahora guardamos también el usuario que dispara la validación.

const client = require('../whatsapp/client');
const pending = require('../pendingPhones');
const Usuario = require('../models/Usuario');
const Transferencia = require('../models/Transferencia');
const { cargar, retirar, crearUsuario } = require('../scrap/scrapPage');

module.exports = (io) => {
    io.on('connection', (socket) => {

        // Ahora el evento recibe: usuario, teléfono y callback
        socket.on('validar-telefono-y-crear-usuario', async (usuario, telefono, callback) => {
            if (pending.has(telefono)) {
                return callback({
                    ok: false,
                    msg: 'Ya enviamos un mensaje, espera a que expire (5 min).'
                });
            }

            // Guardamos el teléfono, el socket y el usuario
            pending.add(telefono, socket, usuario);

            // Auto-eliminación a los 5 minutos si no confirman
            setTimeout(async () => {
                // Si ya no está en pendientes, salir
                if (!pending.has(telefono)) return;

                // Ahí sí removemos y enviamos aviso de expirado
                pending.remove(telefono);
                console.log(`Pendiente de ${telefono} eliminado tras 5 min sin verificar.`);

                try {
                    await client.sendMessage(
                        telefono,
                        'Expiró el tiempo de validación. Vuelve a solicitarla si lo deseas.'
                    );
                } catch (err) {
                    console.error('Error enviando mensaje de expiración:', err);
                }
            }, 5 * 60 * 1000);

            await client.sendMessage(
                telefono,
                'Te estás intentando registrar en el casino. ¿Autorizas este número?'
            );

            callback({ ok: true, msg: 'Mensaje de validación enviado.' });
        });

        socket.on('crear-usuario', async (usuario, telefono) => {
            const res = await crearUsuario(usuario);
            if (res === 'ok') {
                try {
                    const nuevo = new Usuario({ usuario: user, telefono });
                    await nuevo.save();
                    socket.emit('usuario-respuesta', {
                        status: 'ok',
                        username: user,
                        mongoId: nuevo._id
                    });
                } catch (err) {
                    console.error('Error guardando en Mongo:', err);
                    socket.emit('usuario-respuesta', {
                        status: 'error',
                        message: 'No se pudo guardar en la base de datos'
                    });
                }
            } else if (res === 'taken') {
                socket.emit('usuario-respuesta', {
                    status: 'taken',
                    message: 'El nombre de usuario ya estaba en uso'
                });
            } else {
                socket.emit('usuario-respuesta', {
                    status: 'error',
                    message: 'Ocurrió un error creando el usuario'
                });
            }
        });

        socket.on('validar-usuario', async (id, callback) => {
            try {
                const user = await Usuario.findById(id);
                if (user) {
                    callback({ status: 'ok', user });   // devuelve status ok y datos opcionales
                } else {
                    callback({ status: 'fail' });
                }
            } catch (err) {
                console.error('Error validando usuario:', err);
                callback({ status: 'fail' });
            }
        });

        socket.on('login', async (usuario, callback) => {
            try {
                const user = await Usuario.findOne({ usuario });
                if (user) {
                    callback({ status: 'ok', id: user._id });
                } else {
                    callback({ status: 'fail' });
                }
            } catch (err) {
                console.error('Error buscando usuario:', err);
                callback({ status: 'fail' });
            }
        });

        socket.on('cargar', async (data, callback) => {
            try {
                // 1. Buscar si ya existe una transferencia con ese importe
                const existente = await Transferencia.findOne({ importe: data.importe });
                if (existente) {
                    const res = await cargar(data.usuario, data.importe);
                    if (res === 'ok') {
                        callback({
                            status: 'ok',
                            message: 'Carga realizada con éxito'
                        });
                    } else {
                        callback({
                            status: 'error',
                            message: 'Error al cargar el importe'
                        });
                    }
                } else {
                    callback({
                        status: 'not_found',
                        message: 'No se encontró una transferencia con ese importe'
                    });
                }
            } catch (err) {
                console.error('Error cargando:', err);
                callback({
                    status: 'error',
                    message: 'Ocurrió un error al cargar'
                });
            }
        });

        socket.on('retiro', async (data, callback) => {
            try {
                const res = await retirar(data.usuario, data.importe);
                if (res === 'ok') {
                    callback({ status: 'ok' });
                } else if (res === 'faltante') {
                    callback({ status: 'faltante' });
                } else {
                    callback({ status: 'error' });
                }
            } catch (err) {
                console.error('Error en el retiro:', err);
                callback({ status: 'error' });
            }
        });
    });
};
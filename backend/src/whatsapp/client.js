// client.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const pending = require('../pendingPhones');
const { crearUsuario } = require('../scrap/scrapPage');
const Usuario = require('../models/Usuario'); // ajusta la ruta si tu modelo está en otro sitio

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('ready', () => {
    console.log('Cliente de WhatsApp listo!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('message', async message => {
    const from = message.from; // e.g. '54911xxxxxxx@c.us'

    if (pending.has(from)) {
        // Recuperamos el socket que pidió validar este número

        const socket = pending.getSocket(from);
        const user = pending.getUser(from);

        console.log(`Número ${from} verificado por el usuario ${user}`);

        // Lo eliminamos de pendientes
        pending.remove(from);

        // Respondemos al usuario
        await message.reply('¡Número verificado! 🎉');

        // Emitimos el evento al cliente web
        socket.emit('telefono-verificado', from);

        const res = await crearUsuario(user);

        // 3. Si vino bien, lo salvamos en Mongo
        if (res === 'ok') {
            try {
                const nuevo = new Usuario({ usuario: user, telefono: from });
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
    }
});

client.initialize();
module.exports = client;
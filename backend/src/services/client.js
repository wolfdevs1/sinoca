const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const pending = require('./pendingPhones');

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
    const from = message.from;
    if (pending.has(from)) {
        const { name, socket, step } = pending.get(from);
        if (step === 'register' && message.body.toLowerCase() === 'si') {
            await message.reply('¡Número verificado! 🎉');
            pending.remove(from);
            socket.emit('verified', { ok: true, msg: 'Número verificado' });
        } else if (step === 'new-account' && message.body.toLowerCase() === 'si') {
            await message.reply('¡Número verificado! 🎉');
            pending.remove(from);
            socket.emit('verified', { ok: true, msg: 'Alias verificado' });
        }
    }
});

client.initialize();

module.exports = client;
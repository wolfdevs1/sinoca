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
        const { socket, step } = pending.get(from);
        const isRegisterStep = step === 'register' || step === 'new-account' || step === 'login';
        const isNegativeResponse = message.body.trim().toLowerCase() === 'no';
        if (isRegisterStep) {
            if (isNegativeResponse) {
                await message.reply('Acción denegada');
                pending.remove(from);
                return;
            }
            let successMessage = '¡Número verificado! 🎉';
            if (step === 'new-account') {
                successMessage = 'Alias registrado con éxito';
            } else if (step === 'login') {
                successMessage = 'Acceso verificado';
            }
            await message.reply(successMessage);
            pending.remove(from);
            socket.emit('verified', { ok: true, msg: successMessage });
        }
    }
});

client.initialize();

module.exports = client;
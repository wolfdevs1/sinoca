const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const socketHandler = require('./socket/socketHandler');
const checkEmails = require('./emailChecker/emailChecker');
require('./whatsapp/client'); // Inicializa WhatsApp al arrancar el servidor

const server = http.createServer(app);

const io = new Server(server, {
    cors: "*",
});

socketHandler(io);
//checkEmails();

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
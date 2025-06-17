require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const socketHandler = require('./services/socketHandler');
const checkEmails = require('./services/emailChecker');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: "*",
});

socketHandler(io);
checkEmails();

// Conexión a MongoDB
mongoose.connect("mongodb://localhost:27017/sinoca")
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error(err));

// 1) Servimos los archivos estáticos
const publicDir = path.join(__dirname, '../public'); // o 'public' según donde esté server.js
app.use(express.static(publicDir));

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// 3) Catch-all para React Router: **sólo** después de las APIs
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Server escuchando en puerto ${PORT}`));
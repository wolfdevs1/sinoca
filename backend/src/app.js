const express = require('express');
const cors = require('cors');
require('./database/connection'); // Conexión a MongoDB

const app = express();

app.use(cors());
app.use(express.static('public')); // Archivos estáticos

module.exports = app;

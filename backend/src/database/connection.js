const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sinoca')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión:', err));
const mongoose = require('mongoose');
const { Schema } = mongoose;

const Transferencia = new Schema({
    nombre: {
        type: String,
    },
    importe: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model('Transferencia', Transferencia);
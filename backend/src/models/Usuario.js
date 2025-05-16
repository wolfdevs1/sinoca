const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    cuentas: {
        type: Array,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);
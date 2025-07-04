const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    accounts: { type: Array },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    firstBonus: {
        state: { type: Boolean, default: true },
    },
    specialBonus: {
        state: { type: Boolean, default: true },
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
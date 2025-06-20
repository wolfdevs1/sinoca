const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    accounts: { type: Array },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    firstBonus: {
        state: { type: Boolean, default: true },
        amount: { type: Number, default: 20 }
    },
    specialBonus: {
        state: { type: Boolean, default: false },
        amount: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
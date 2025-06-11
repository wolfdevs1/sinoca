const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    name: { type: String, },
    amount: { type: String },
    account: { type: String },
    used: { type: Boolean }
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);
const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    name: { type: String, },
    amount: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);
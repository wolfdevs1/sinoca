const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    account: { type: String },
    amount: { type: String },
    state: { type: Boolean },
    name: { type: String },
    phone: { type: String },
    withdrawAccount: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Withdraw', withdrawSchema);
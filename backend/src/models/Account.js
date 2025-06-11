const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    name: { type: String },
    alias: { type: String },
    bank: { type: String },
    email: { type: String },
    password: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
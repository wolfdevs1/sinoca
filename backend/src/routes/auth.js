const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createUser } = require('../services/scrapPage');

// Login
router.post('/login', async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });
        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.json({ token, user: { name: user.name, phone: user.phone, accounts: user.accounts, role: user.role } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const response = await createUser(name);
        if (response === 'error') return res.status(400).json({ error: 'Error al crear el usuario en la página de apuestas' });
        if (response === 'taken') return res.status(400).json({ error: 'El usuario ya existe en la página de apuestas' });
        if (response === 'ok') {
            const bonus = { inicial: { state: true, amount: 10 } };
            const newUser = await User.create({ name, phone, role: 'user', bonus });
            const payload = { id: newUser._id, role: newUser.role };
            const token = jwt.sign(payload, process.env.JWT_SECRET);
            res.json({ token });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
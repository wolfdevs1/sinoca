const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const { deposit, withdraw, changePassword } = require('../services/scrapPage');

// Ruta para cualquier usuario autenticado
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user.id).select('name phone accounts role');  // sólo esos tres
    res.json(user);
});

router.post('/deposit', protect, async (req, res) => {
    const { name, amount } = req.body;
    const transfer = await Transfer.findOne({ amount });
    if (transfer) {
        const response = await deposit(name, amount);
        if (response === 'ok') {
            //await Transfer.findByIdAndDelete(transfer._id);
            res.json({ message: 'Depósito cargado correctamente' });
        } else if (response === 'error') {
            res.status(400).json({ error: 'Error al cargar el depósito' });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    } else {
        res.status(400).json({ error: 'No se encontro ningun deposito con esa información' });
    }
});

router.post('/withdraw', protect, async (req, res) => {
    const { name, amount } = req.body;
    const response = await withdraw(name, amount);
    if (response === 'ok') {
        res.json({ message: 'Retiro cargado correctamente' });
    } else if (response === 'error') {
        res.status(400).json({ error: 'Error al cargar el retiro' });
    } else if (response === 'insufficient') {
        res.status(400).json({ error: 'No tiene esa cantidad de fichas' });
    } else {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/change-password', protect, async (req, res) => {
    try {
        const { name } = req.body;
        const result = await changePassword(name);
        if (result !== 'ok') {
            return res.status(400).json({ error: 'Error al cambiar la contraseña' });
        }
        return res.status(200).json({ message: 'Contraseña cambiada correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta solo para administradores
router.get('/all', protect, adminOnly, async (req, res) => {
    const users = await User.find().select('name email role');  // sólo esos tres
    res.json(users);
});

module.exports = router;
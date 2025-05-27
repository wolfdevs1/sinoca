const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const { deposit, withdraw, changePassword, unlockUser } = require('../services/scrapPage');
const Withdraw = require('../models/Withdraw');
const Account = require('../models/Account');

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
    const { name, amount, account, phone } = req.body;
    const response = await withdraw(name, amount);
    if (response === 'ok') {
        await Withdraw.create({ account, amount, name, phone });
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

router.post('/unlock-user', protect, async (req, res) => {
    try {
        const { name } = req.body;
        const result = await unlockUser(name);
        if (result !== 'ok') {
            return res.status(400).json({ error: 'Error al desbloquear usuario' });
        }
        return res.status(200).json({ message: 'Usuario desbloqueado correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/new-account', protect, async (req, res) => {
    try {
        const { account } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                // pushea un nuevo objeto al array accounts
                $push: {
                    accounts: { name: account }
                }
            },
            { new: true } // devuelve el documento actualizado
        );
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        };
        return res.status(200).json({ message: 'Alias agregado correctamente', user: { name: user.name, phone: user.phone, accounts: user.accounts, role: user.role } });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/add-new-account', protect, adminOnly, async (req, res) => {
    try {
        const { name, alias } = req.body;
        await Account.create({ name, alias });
        return res.status(200).json({ message: 'Cuenta agregada correctamente' });
    } catch (error) {
        console.log(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/delete-account', protect, adminOnly, async (req, res) => {
    try {
        await Account.findByIdAndDelete(req.body.id);
        return res.status(200).json({ message: 'Cuenta borrada correctamente' });
    } catch (error) {
        console.log(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/change-withdraw-state', protect, adminOnly, async (req, res) => {
    try {
        await Withdraw.findByIdAndUpdate(req.body.id, { state: req.body.value });
        res.status(200).json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta solo para administradores
router.get('/all', protect, adminOnly, async (req, res) => {
    const users = await User.find().select('name phone role');  // sólo esos tres
    res.json(users);
});

router.get('/withdraws', protect, adminOnly, async (req, res) => {
    const withdraws = await Withdraw.find();
    res.json(withdraws);
});

router.get('/accounts', protect, adminOnly, async (req, res) => {
    const accounts = await Account.find().select('name alias');
    res.json(accounts);
});

router.get('/random-account', protect, async (req, res) => {
    const account = await Account.aggregate([
        { $sample: { size: 1 } },  // Selecciona un documento aleatorio
        { $project: { name: 1, alias: 1 } }  // Proyecta solo los campos name y alias
    ]);
    res.json(account[0]);  // Dado que $sample devuelve un array, accedemos al primer elemento
});

module.exports = router;
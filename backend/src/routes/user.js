const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const { deposit, withdraw, changePassword, unlockUser } = require('../services/scrapPage');
const Withdraw = require('../models/Withdraw');
const Account = require('../models/Account');

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

function formatNumber(number) {
    let numero = number.replaceAll(',', '.');
    if (numero[numero.length - 3] === '.') {
        numero = setCharAt(numero, numero.length - 3, ',');
    } else if (numero[numero.length - 2] === '.') {
        numero = setCharAt(numero, numero.length - 2, ',');
    }
    return numero.replaceAll('.', '');
}

// Ruta para cualquier usuario autenticado
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user.id).select('name phone accounts role');  // sólo esos tres
    res.json(user);
});

router.post('/deposit', protect, async (req, res) => {
    const { name, amount } = req.body;
    const transfer = await Transfer.findOne({ amount: formatNumber(amount), used: false });
    if (transfer) {
        await Transfer.findByIdAndUpdate(transfer._id, { used: true });
        const response = await deposit(name, formatNumber(amount));
        if (response === 'ok') {
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
        const { name, alias, bank, email, password } = req.body;
        await Account.create({ name, alias, bank, email, password });
        return res.status(200).json({ message: 'Cuenta agregada correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/delete-account', protect, adminOnly, async (req, res) => {
    try {
        await Account.findByIdAndDelete(req.body.id);
        return res.status(200).json({ message: 'Cuenta borrada correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/change-withdraw-state', protect, adminOnly, async (req, res) => {
    try {
        await Withdraw.findByIdAndUpdate(req.body.withdrawId, { state: true, withdrawAccount: req.body.withdrawAccount });
        res.status(200).json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta solo para administradores
router.get('/all', protect, adminOnly, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
        .select('name phone role')
        .sort({ createdAt: -1 }) // opcional: orden por fecha
        .skip(skip)
        .limit(limit);

    const pages = Math.ceil(total / limit);

    res.json({ users, page, pages, total });
});

router.get(
    '/withdraws',
    protect,
    adminOnly,
    async (req, res) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);

        const skip = (page - 1) * limit;
        const excludeNames = ['Egreso manual', 'Retiro'];

        const total = await Withdraw.countDocuments({ name: { $nin: excludeNames } });
        const pages = Math.ceil(total / limit);

        const withdraws = await Withdraw
            .find({ name: { $nin: excludeNames } })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({ withdraws, total, page, pages });
    }
);

router.get(
    '/transfers',
    protect,
    adminOnly,
    async (req, res) => {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);

        const skip = (page - 1) * limit;
        const excludeNames = ['Ingreso manual', 'Aporte'];

        const total = await Transfer.countDocuments({ name: { $nin: excludeNames } });
        const pages = Math.ceil(total / limit);

        const transfers = await Transfer
            .find({ name: { $nin: excludeNames } })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({ transfers, total, page, pages });
    }
);

router.get('/accounts', protect, adminOnly, async (req, res) => {
    const accounts = await Account.find().select('name alias bank email password');
    res.json(accounts);
});

router.get('/caja', protect, adminOnly, async (req, res) => {
    try {
        const transfers = await Transfer.find();
        const withdraws = await Withdraw.find({ state: true });

        const saldos = {};

        // Sumar transfers
        transfers.forEach(t => {
            const acc = t.account;
            saldos[acc] = (saldos[acc] || 0) + parseFloat(t.amount.replace(',', '.') || 0);
        });

        // Restar withdraws
        withdraws.forEach(w => {
            const acc = w.withdrawAccount;
            saldos[acc] = (saldos[acc] || 0) - parseFloat(w.amount.replace(',', '.') || 0);
        });

        res.json(saldos); // ejemplo: { "cuenta1": 3000, "cuenta2": 1500 }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al calcular saldos' });
    }
});

router.post('/manual-transfer', protect, adminOnly, async (req, res) => {
    const { name, amount, account } = req.body;
    try {
        const transfer = await Transfer.create({
            name: name || 'Ingreso manual',
            amount,
            account,
            used: true
        });
        res.json(transfer);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar transfer' });
    }
});

router.post('/manual-withdraw', protect, adminOnly, async (req, res) => {
    const { name, amount, withdrawAccount } = req.body;
    try {
        const withdraw = await Withdraw.create({
            name: name || 'Egreso manual',
            amount,
            withdrawAccount,
            state: true
        });
        res.json(withdraw);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar withdraw' });
    }
});

router.get('/caja/resumen', protect, adminOnly, async (req, res) => {
    try {
        const transfers = await Transfer.find({
            name: { $ne: 'Aporte' } // excluye aportes del ingreso
        });

        const aportes = await Transfer.find({ name: 'Aporte' });

        const withdraws = await Withdraw.find({
            state: true,
            name: { $ne: 'Retiro' } // excluye retiros del egreso
        });

        const retiros = await Withdraw.find({ name: 'Retiro', state: true });

        let resumen = {
            ingreso: 0,
            egreso: 0,
            aporte: 0,
            retiro: 0
        };

        transfers.forEach(t => {
            resumen.ingreso += parseFloat((t.amount || '0').replace(',', '.'));
        });

        aportes.forEach(t => {
            resumen.aporte += parseFloat((t.amount || '0').replace(',', '.'));
        });

        withdraws.forEach(w => {
            resumen.egreso += parseFloat((w.amount || '0').replace(',', '.'));
        });

        retiros.forEach(w => {
            resumen.retiro += parseFloat((w.amount || '0').replace(',', '.'));
        });

        res.json(resumen);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al calcular resumen' });
    }
});

router.get('/random-account', protect, async (req, res) => {
    const account = await Account.aggregate([
        { $sample: { size: 1 } },  // Selecciona un documento aleatorio
        { $project: { name: 1, alias: 1 } }  // Proyecta solo los campos name y alias
    ]);
    res.json(account[0]);  // Dado que $sample devuelve un array, accedemos al primer elemento
});

module.exports = router;
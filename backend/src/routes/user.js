const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const Withdraw = require('../models/Withdraw');
const Account = require('../models/Account');
const CONSTANTE = require('../services/constants');

const { deposit, withdraw, changePassword, unlockUser } = require('../services/scrapPageBirigol');

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
};

function formatNumber(number) {
    let numero = number.replaceAll(',', '.');
    if (numero[numero.length - 3] === '.') {
        numero = setCharAt(numero, numero.length - 3, ',');
    } else if (numero[numero.length - 2] === '.') {
        numero = setCharAt(numero, numero.length - 2, ',');
    }
    return numero.replaceAll('.', '');
};

// Ruta para cualquier usuario autenticado
router.get('/profile', protect, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
});

router.post('/deposit', protect, async (req, res) => {
    try {
        let { user, amount } = req.body;
        const usuario = await User.findById(user._id);

        // 1) Buscamos el transfer no usado
        const transfer = await Transfer.findOne({
            amount: formatNumber(amount),
            used: false
        });
        if (!transfer) {
            return res.status(400).json({ error: 'No se encontró ningún depósito con esa información' });
        }

        // Marcamos el transfer como usado
        await Transfer.findByIdAndUpdate(transfer._id, {
            used: true,
            user: user.name
        });

        // 2) Calculamos el bonus si corresponde
        let bonusPercent = 0;

        if (usuario.firstBonus?.state) {
            // Si tiene firstBonus activo
            bonusPercent = CONSTANTE.getFirstBonus();          // ej. 20
            // Desactivamos el bonus en la base
            await User.findByIdAndUpdate(usuario._id, {
                'firstBonus.state': false
            });
        } else if (usuario.specialBonus?.state) {
            // Si tiene specialBonus activo
            bonusPercent = CONSTANTE.getSpecialBonus();        // ej. 10
        }

        // Si hubo algún bonus, lo aplicamos
        if (bonusPercent > 0) {
            const monto = parseFloat(amount);
            const bonusValue = monto * (bonusPercent / 100);
            const totalConBonus = monto + bonusValue;
            amount = totalConBonus.toFixed(2); // string con 2 decimales
        }

        // 3) Hacemos el depósito real
        console.log(formatNumber(amount));
        const response = await deposit(user.name, formatNumber(amount));

        if (response === 'ok') {
            return res.json({ message: 'Depósito cargado correctamente', amountConBonus: amount });
        } else if (response === 'error') {
            return res.status(400).json({ error: 'Error al cargar el depósito' });
        } else {
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

    } catch (err) {
        console.error('Error en /deposit:', err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/random-account', protect, async (req, res) => {
    const account = await Account.aggregate([
        { $sample: { size: 1 } },  // Selecciona un documento aleatorio
        { $project: { name: 1, alias: 1 } }  // Proyecta solo los campos name y alias
    ]);
    res.json(account[0]);  // Dado que $sample devuelve un array, accedemos al primer elemento
});

router.post('/withdraw', protect, async (req, res) => {
    const { name, amount, account, phone } = req.body;
    const response = await withdraw(name, amount.toString());
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
        return res.status(200).json({ message: 'Contraseña cambiada correctamente, su nueva contraseña es: cambiar123' });
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

// Obtener últimos 5 retiros del usuario autenticado
router.get('/my-withdraws', protect, async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Falta el nombre del usuario' });
    }

    try {
        const withdraws = await Withdraw
            .find({ name })
            .sort({ createdAt: -1 }) // Más nuevos primero
            .limit(5);               // Solo los últimos 5

        res.json({ withdraws });
    } catch (err) {
        console.error('Error al obtener retiros del usuario:', err);
        res.status(500).json({ error: 'Error al obtener los retiros' });
    }
});

router.delete('/withdraw/:id', protect, async (req, res) => {
    const { id } = req.params;

    try {
        const withdraw = await Withdraw.findById(id);
        if (!withdraw) return res.status(404).json({ error: "Retiro no encontrado" });

        if (withdraw.state) {
            return res.status(400).json({ error: "Este retiro ya fue procesado y no se puede cancelar" });
        }

        const response = await deposit(withdraw.name, formatNumber(withdraw.amount));
        if (response === 'ok') {
            await Withdraw.findByIdAndDelete(id);
            res.json({ message: "Retiro cancelado correctamente" });
        } else if (response === 'error') {
            res.status(400).json({ error: 'Error al cargar el depósito' });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }

    } catch (err) {
        console.error('Error al cancelar retiro:', err);
        res.status(500).json({ error: "Error interno al cancelar retiro" });
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
        const { id } = req.body;

        // 1. Buscar la cuenta
        const account = await Account.findById(id);
        if (!account) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        const accountName = account.name;

        // 2. Obtener todos los ingresos y egresos asociados
        const transfers = await Transfer.find({ account: accountName });
        const withdraws = await Withdraw.find({ withdrawAccount: accountName, state: true });

        // 3. Calcular saldo
        let saldo = 0;

        transfers.forEach(t => {
            const valor = parseFloat(t.amount.replace(',', '.'));
            if (!isNaN(valor)) saldo += valor;
        });

        withdraws.forEach(w => {
            const valor = parseFloat(w.amount.replace(',', '.'));
            if (!isNaN(valor)) saldo -= valor;
        });

        // 4. Si hay saldo, crear un retiro
        if (saldo > 0) {
            await Withdraw.create({
                name: 'Retiro',
                descripcion: "Retiro automático al eliminar",
                amount: saldo.toFixed(2).replace('.', ','), // mismo formato que usás en tus registros
                withdrawAccount: accountName,
                state: true
            });
        }

        // 5. Eliminar la cuenta
        await Account.findByIdAndDelete(id);

        return res.status(200).json({
            message: `Cuenta borrada correctamente${saldo > 0 ? ` y se retiraron $${saldo.toFixed(2)}` : ''}`
        });
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

router.get('/all', protect, adminOnly, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {
        $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ]
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('name phone role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const pages = Math.ceil(total / limit);

    res.json({ users, page, pages, total });
});

router.get('/withdraws', protect, adminOnly, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const excludeNames = ['Egreso', 'Retiro'];

    const query = {
        name: { $nin: excludeNames },
        ...(search && {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { account: { $regex: search, $options: 'i' } },
                { amount: { $regex: search, $options: 'i' } },
            ]
        })
    };

    const total = await Withdraw.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const withdraws = await Withdraw
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    res.json({ withdraws, total, page, pages });
});

router.get('/transfers', protect, adminOnly, async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const search = req.query.search || '';
    const state = req.query.state; // 'used' o 'unused'
    const skip = (page - 1) * limit;

    const excludeNames = ['Ingreso', 'Aporte'];

    const query = {
        name: { $nin: excludeNames },
        ...(search && {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { amount: { $regex: search, $options: 'i' } },
                { user: { $regex: search, $options: 'i' } },
            ]
        }),
        ...(state === 'used' && { used: true }),
        ...(state === 'unused' && { used: false }),
    };

    const total = await Transfer.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const transfers = await Transfer
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    res.json({ transfers, total, page, pages });
});

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

        res.json(saldos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al calcular saldos' });
    }
});

router.post('/manual-transfer', protect, adminOnly, async (req, res) => {
    const { name, amount, account, descripcion } = req.body;
    try {
        const transfer = await Transfer.create({
            name,
            descripcion: descripcion || 'Sin descripción',
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
    const { name, amount, withdrawAccount, descripcion } = req.body;
    try {
        const withdraw = await Withdraw.create({
            name: name,
            descripcion: descripcion || 'Sin descripción',
            amount,
            withdrawAccount,
            state: true
        });
        res.json(withdraw);
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar withdraw' });
    }
});

router.get('/caja/historial', protect, adminOnly, async (req, res) => {
    const { page = 1, limit = 10, search = '', type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    try {
        let query = {};
        let Model = null;

        // Definir modelo y query según el tipo
        if (type === 'ingreso') {
            Model = Transfer;
            query = { name: 'Ingreso' };
        } else if (type === 'aporte') {
            Model = Transfer;
            query = { name: 'Aporte' };
        } else if (type === 'egreso') {
            Model = Withdraw;
            query = { name: 'Egreso' };
        } else if (type === 'retiro') {
            Model = Withdraw;
            query = { name: 'Retiro' };
        } else {
            return res.status(400).json({ error: 'Tipo de movimiento inválido' });
        }

        // Agregar búsqueda si hay término
        if (search) {
            query.$or = [
                { descripcion: { $regex: search, $options: 'i' } },
                { account: { $regex: search, $options: 'i' } },
                { withdrawAccount: { $regex: search, $options: 'i' } }
            ];
        }

        // Obtener total
        const total = await Model.countDocuments(query);
        const pages = Math.ceil(total / limit);

        // Obtener historial
        const historial = await Model.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({ historial, pages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

router.get('/caja/resumen', protect, adminOnly, async (req, res) => {
    try {
        const monthParam = req.query.month;
        const date = monthParam ? new Date(`${monthParam}-01`) : new Date();
        const startOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0, 23, 59, 59);

        const transfers = await Transfer.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            name: { $ne: 'Aporte' }
        });

        const aportes = await Transfer.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            name: 'Aporte'
        });

        const withdraws = await Withdraw.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            state: true,
            name: { $ne: 'Retiro' }
        });

        const retiros = await Withdraw.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            name: 'Retiro',
            state: true
        });

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

router.get('/variables', async (req, res) => {
    try {
        const firstBonus = CONSTANTE.getFirstBonus();
        const specialBonus = CONSTANTE.getSpecialBonus();
        const casinoName = CONSTANTE.getCasinoName();
        const supportNumber = CONSTANTE.getSupportNumber();
        const panelUser = CONSTANTE.getPanelUser();
        const panelPassword = CONSTANTE.getPanelPassword();
        const nombrePagina = CONSTANTE.getNombrePagina();
        const pixel = CONSTANTE.getPixel(); // ✅ nuevo

        res.json({
            firstBonus,
            specialBonus,
            casinoName,
            supportNumber,
            panelUser,
            panelPassword,
            nombrePagina,
            pixel, // ✅ devolver pixel
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener variables' });
    }
});

router.post('/variables', protect, adminOnly, async (req, res) => {
    try {
        const {
            firstBonus,
            specialBonus,
            casinoName,
            supportNumber,
            panelUser,
            panelPassword,
            nombrePagina,
            pixel, // ✅ recibir pixel
        } = req.body;

        CONSTANTE.setFirstBonus(firstBonus);
        CONSTANTE.setSpecialBonus(specialBonus);
        CONSTANTE.setCasinoName(casinoName);
        CONSTANTE.setSupportNumber(supportNumber);
        CONSTANTE.setPanelUser(panelUser);
        CONSTANTE.setPanelPassword(panelPassword);
        CONSTANTE.setNombrePagina(nombrePagina);
        CONSTANTE.setPixel(pixel); // ✅ guardar pixel

        res.json({ message: 'Variables actualizadas correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar variables' });
    }
});

router.delete('/delete/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno al eliminar usuario' });
    }
});

router.delete('/transfer/:id', protect, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        const transfer = await Transfer.findById(id);
        if (!transfer) return res.status(404).json({ error: 'Transferencia no encontrada' });

        if (transfer.used) {
            return res.status(400).json({ error: 'No se puede borrar una transferencia ya reclamada' });
        }

        await Transfer.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Transferencia eliminada correctamente' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al eliminar transferencia' });
    }
});

module.exports = router;
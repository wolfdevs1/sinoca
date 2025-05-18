const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'No autorizado' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin')
        return res.status(403).json({ error: 'Requiere rol de administrador' });
    next();
};
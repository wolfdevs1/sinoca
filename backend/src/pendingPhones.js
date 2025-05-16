// pendingPhones.js
// ----------------
// Gestiona la lista de teléfonos pendientes de verificar,
// guardando para cada uno el socket y el usuario que lo inició.

const map = new Map();

/**
 * Añade un teléfono pendiente junto con su socket y usuario
 * @param {string} phone 
 * @param {Socket} socket 
 * @param {any} user 
 */
function add(phone, socket, user) {
    map.set(phone, { socket, user });
}

/** @param {string} phone */
function has(phone) {
    return map.has(phone);
}

/** @param {string} phone */
function remove(phone) {
    map.delete(phone);
}

/**
 * Devuelve el objeto { socket, user } para un teléfono dado
 * @param {string} phone 
 */
function get(phone) {
    return map.get(phone);
}

/**
 * Opcionales, para obtener sólo socket o sólo user
 */
function getSocket(phone) {
    const entry = map.get(phone);
    return entry?.socket;
}

function getUser(phone) {
    const entry = map.get(phone);
    return entry?.user;
}

module.exports = { add, has, remove, get, getSocket, getUser };
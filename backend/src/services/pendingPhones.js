// pendingPhones.js
// ----------------
// Gestiona la lista de teléfonos pendientes de verificar,
// guardando para cada uno el socket y el usuario que lo inició.

const map = new Map();

/**
 * Añade un teléfono pendiente junto con su socket y usuario
 * @param {string} phone 
 * @param {Socket} socket 
 * @param {any} name 
 */
function add(phone, name, socket, step = '') {
    map.set(phone, { name, socket, step });
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


module.exports = { add, has, remove, get };
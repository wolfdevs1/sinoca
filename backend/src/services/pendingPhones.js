// pendingPhones.js
// ----------------
// Gestiona la lista de teléfonos pendientes de verificar,
// guardando para cada uno el socket, usuario y su timeoutId

const map = new Map();

/**
 * Añade un teléfono pendiente junto con su socket, usuario y paso
 * @param {string} phone 
 * @param {string} name 
 * @param {Socket} socket 
 * @param {string} step 
 * @param {Timeout} timeoutId 
 */
function add(phone, name, socket, step = '', timeoutId) {
    map.set(phone, { name, socket, step, timeoutId });
}

function has(phone) {
    return map.has(phone);
}

function remove(phone) {
    const data = map.get(phone);
    if (data?.timeoutId) {
        clearTimeout(data.timeoutId); // Cancelar timeout si existe
    }
    map.delete(phone);
}

function get(phone) {
    return map.get(phone);
}

module.exports = { add, has, remove, get };
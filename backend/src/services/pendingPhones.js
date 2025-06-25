// pendingPhones.js
// ----------------
// Gestiona la lista de teléfonos pendientes de verificar,
// guardando userId, nombre, paso y timeoutId

const map = new Map();

/**
 * Añade un teléfono pendiente junto con su userId, usuario y paso
 * @param {string} phone 
 * @param {string} name 
 * @param {string} userId 
 * @param {string} step 
 * @param {Timeout} timeoutId 
 */
function add(phone, name, userId, step = '', timeoutId) {
    map.set(phone, { name, userId, step, timeoutId });
}

function has(phone) {
    return map.has(phone);
}

function remove(phone) {
    const data = map.get(phone);
    if (data?.timeoutId) {
        clearTimeout(data.timeoutId);
    }
    map.delete(phone);
}

function get(phone) {
    return map.get(phone);
}

module.exports = { add, has, remove, get };
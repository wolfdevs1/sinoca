const fs = require('fs');
const CONSTANTE = {};

CONSTANTE.PAGINA = 'Birigol';
CONSTANTE.PAGINA_WEB = 'birigol.com';
CONSTANTE.PAGINA_PANEL_ADMIN = `https://admin.birigol.com`;

CONSTANTE.LAUNCH_OPTIONS = {
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ["--window-position=500,0", "--no-sandbox", "--disable-setuid-sandbox"],
};

CONSTANTE.getNombrePagina = () => {
    return fs.readFileSync('./src/services/variables/nombrePagina.txt', 'utf8').trim();
};

CONSTANTE.getPanelUser = () => {
    return fs.readFileSync('./src/services/variables/panelUser.txt', 'utf8').trim();
};

CONSTANTE.getPanelPassword = () => {
    return fs.readFileSync('./src/services/variables/panelPassword.txt', 'utf8').trim();
};

CONSTANTE.getFirstBonus = () => {
    return parseInt(fs.readFileSync('./src/services/variables/firstBonus.txt', 'utf8'));
};

CONSTANTE.getSpecialBonus = () => {
    return parseInt(fs.readFileSync('./src/services/variables/specialBonus.txt', 'utf8'));
};

CONSTANTE.getCasinoName = () => {
    return fs.readFileSync('./src/services/variables/casinoName.txt', 'utf8').trim();
};

CONSTANTE.getSupportNumber = () => {
    return fs.readFileSync('./src/services/variables/supportNumber.txt', 'utf8').trim();
};

// ✅ Nuevo: getter para Pixel
CONSTANTE.getPixel = () => {
    return fs.readFileSync('./src/services/variables/pixel.txt', 'utf8').trim();
};

CONSTANTE.setNombrePagina = (nombre) => {
    fs.writeFileSync('./src/services/variables/nombrePagina.txt', nombre);
};

CONSTANTE.setPanelUser = (usuario) => {
    fs.writeFileSync('./src/services/variables/panelUser.txt', usuario);
};

CONSTANTE.setPanelPassword = (password) => {
    fs.writeFileSync('./src/services/variables/panelPassword.txt', password);
};

CONSTANTE.setFirstBonus = (amount) => {
    fs.writeFileSync('./src/services/variables/firstBonus.txt', amount.toString());
};

CONSTANTE.setSpecialBonus = (amount) => {
    fs.writeFileSync('./src/services/variables/specialBonus.txt', amount.toString());
};

CONSTANTE.setCasinoName = (nombre) => {
    fs.writeFileSync('./src/services/variables/casinoName.txt', nombre);
};

CONSTANTE.setSupportNumber = (numero) => {
    fs.writeFileSync('./src/services/variables/supportNumber.txt', numero);
};

// ✅ Nuevo: setter para Pixel
CONSTANTE.setPixel = (valor) => {
    fs.writeFileSync('./src/services/variables/pixel.txt', valor);
};

module.exports = CONSTANTE;
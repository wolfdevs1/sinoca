const fs = require('fs');
const CONSTANTE = {};

CONSTANTE.PAGINA = 'Birigol';
CONSTANTE.PAGINA_WEB = 'birigol.com';
CONSTANTE.PAGINA_PANEL_ADMIN = `https://admin.birigol.com`;
CONSTANTE.PAGINA_USER_ADMIN = 'lautaro1991';
CONSTANTE.PAGINA_PASS_ADMIN = 'Camilote123';

CONSTANTE.LAUNCH_OPTIONS = {
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ["--window-position=500,0", "--no-sandbox", "--disable-setuid-sandbox"],
};

CONSTANTE.getFirstBonus = () => {
    return parseInt(fs.readFileSync('./src/services/variables/firstBonus.txt', 'utf8'));
};

CONSTANTE.getSpecialBonus = () => {
    return parseInt(fs.readFileSync('./src/services/variables/specialBonus.txt', 'utf8'));
};

CONSTANTE.getCasinoName = () => {
    return fs.readFileSync('./src/services/variables/casinoName.txt', 'utf8').trim();
}

CONSTANTE.getSupportNumber = () => {
    return fs.readFileSync('./src/services/variables/supportNumber.txt', 'utf8').trim();
};

CONSTANTE.setFirstBonus = (amount) => {
    fs.writeFileSync('./src/services/variables/firstBonus.txt', amount.toString());
};

CONSTANTE.setSpecialBonus = (amount) => {
    fs.writeFileSync('./src/services/variables/specialBonus.txt', amount.toString());
}

CONSTANTE.setCasinoName = (nombre) => {
    fs.writeFileSync('./src/services/variables/casinoName.txt', nombre);
};

CONSTANTE.setSupportNumber = (numero) => {
    fs.writeFileSync('./src/services/variables/supportNumber.txt', numero);
};

module.exports = CONSTANTE;
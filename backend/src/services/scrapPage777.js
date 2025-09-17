const puppeteer = require('puppeteer');
const {
    LAUNCH_OPTIONS,
    PAGINA_PANEL_ADMIN,
    getPanelUser,
    getPanelPassword,
} = require('./constants');

// Utility: formats numbers like '1.234,56' to '1234.56'
function formatNumber(numberStr) {
    return numberStr.replace(/\./g, '').replace(',', '.');
}

/**
 * Espera a que el selector sea visible y hace click.
 * @param {import('puppeteer').Page} page
 * @param {string} selector
 */

async function clickVisible(page, selector) {
    await page.waitForSelector(selector, { visible: true });
    await page.click(selector);
}

/**
 * Espera a que el selector sea visible y teclea el texto.
 * @param {import('puppeteer').Page} page
 * @param {string} selector
 * @param {string} text
 */
async function typeVisible(page, selector, text) {
    await page.waitForSelector(selector, { visible: true });
    await page.type(selector, text);
}

/**
 * Inicia el navegador, hace login y devuelve { browser, page }.
 */
async function initBrowser() {
    const browser = await puppeteer.launch(LAUNCH_OPTIONS);
    const [page] = await browser.pages();
    page.setDefaultTimeout(60000);
    await page.setViewport({ width: 1920, height: 1080 });

    // Login en el panel
    await page.goto('https://partners.777tip.com/AccountCards/rm5002', { waitUntil: 'load' });
    await typeVisible(page, '#app > div > div > div > label:nth-child(1) > input[type=text]', getPanelUser());
    await typeVisible(page, '#app > div > div > div > label:nth-child(2) > input[type=password]', getPanelPassword());
    await clickVisible(page, '#app > div > div > div > button');
    await new Promise(r => setTimeout(r, 5000)); // espera extra a que cargue todo
    return { browser, page };
}

/**
 * Navega al listado de usuarios y busca por name.
 */
async function goToUser(page, name) {
    //await page.goto(`${PAGINA_PANEL_ADMIN}`, { waitUntil: 'load' });
    await clickVisible(page, '#app > div > div.main > div.account-cards > div.create-container > button.btn.btn-filter');
    await typeVisible(page, '#app > div > div.main > div.account-cards > form > label:nth-child(1) > input[type=text]', name);
    await clickVisible(page, '#app > div > div.main > div.account-cards > form > button');
    await new Promise(r => setTimeout(r, 3000)); // espera a que cargue el filtro
}

/**
 * Crea un usuario y devuelve:
 *  - { status: 'ok', user: 'S962.019258' } si se creó y aparece el modal
 *  - { status: 'taken' } si no aparece modal
 *  - { status: 'error' } en caso de excepción
 */
async function createUser(name) {
    const { browser, page } = await initBrowser();
    try {
        const btnCrear = '#app > div > div.main > div.account-cards > div.create-container > button:nth-child(1)';
        const inputUser = '#app > div > div.main > div.account-cards > div.overlay > div > form > label:nth-child(2) > input[type=text]';
        const inputPass = '#app > div > div.main > div.account-cards > div.overlay > div > form > label:nth-child(3) > input[type=text]';
        const btnSubmit = '#app > div > div.main > div.account-cards > div.overlay > div > form > button';

        const userSpan = '#app > div > div.main > div.account-cards > div.overlay > div > ul > li:nth-child(1) > span:nth-child(2)';

        // Completar y enviar
        await clickVisible(page, btnCrear);
        await typeVisible(page, inputUser, name);
        await typeVisible(page, inputPass, 'cambiar123');
        await clickVisible(page, btnSubmit);

        await new Promise(r => setTimeout(r, 2000)); // espera a que aparezca el modal

        // Ver si existe el span del username
        const exists = await page.$(userSpan);
        if (exists) {
            const user = await page.$eval(userSpan, el => el.textContent.trim());
            return user;
        } else {
            return { status: 'taken' };
        }
    } catch (e) {
        console.error(e);
        return { status: 'error' };
    } finally {
        await browser.close();
    }
}

/**
 * Ajusta saldo con acción 'Cargar' o 'Descargar'.
 * Devuelve 'ok' | 'faltante' | 'error'.
 */
async function adjustBalance(name, amount, action) {
    const { browser, page } = await initBrowser();
    try {
        await goToUser(page, name);

        // Selector de la primera celda de la fila
        const firstCellSelector =
            '#app > div > div.main > div.account-cards > div.general-cards-grid > div > div > div.table-wrapper.block > table > tbody > tr:nth-child(1) > td:nth-child(1)';

        // Espera a que la primera celda tenga el nombre correcto
        await page.waitForFunction(
            (sel, expected) => {
                const el = document.querySelector(sel);
                return el && el.textContent.trim().startsWith(expected);
            },
            { timeout: 10000 }, // hasta 10 segundos de espera
            firstCellSelector,
            name
        );

        // Para 'Descargar', chequea saldo disponible
        if (action === 'Descargar') {
            const saldoText = await page.$eval(
                '#app > div > div.main > div.account-cards > div.general-cards-grid > div > div > div.table-wrapper.block > table > tbody > tr:nth-child(1) > td:nth-child(2)',
                (el) => el.textContent
            );
            const saldo = parseFloat(formatNumber(saldoText));
            const retiro = parseFloat(amount.toString().replace(',', '.'));
            if (retiro > saldo) {
                await browser.close();
                return 'insufficient';
            }
        }

        if (action === 'Cargar') {
            await typeVisible(
                page,
                '#app > div > div.main > div.account-cards > div.general-cards-grid > div > div > div.table-wrapper.block > table > tbody > tr:nth-child(1) > td:nth-child(3) > div > label > input',
                amount
            );
            await clickVisible(
                page,
                '#app > div > div.main > div.account-cards > div.general-cards-grid > div > div > div.table-wrapper.block > table > tbody > tr:nth-child(1) > td:nth-child(3) > div > button'
            );
        } else {
            await typeVisible(
                page,
                '#app > div > div.main > div.account-cards > div.general-cards-grid > div > div > div.table-wrapper.block > table > tbody > tr:nth-child(1) > td:nth-child(4) > div > label > input',
                amount
            );
            await clickVisible(
                page,
                '#app > div > div.main > div.account-cards > div.general-cards-grid > div > div > div.table-wrapper.block > table > tbody > tr:nth-child(1) > td:nth-child(4) > div > button'
            );
        }

        await new Promise(r => setTimeout(r, 3000)); // espera a que procese

        await browser.close();
        return 'ok';
    } catch (err) {
        console.error(err);
        await browser.close();
        return 'error';
    }
}

async function deposit(name, amount) {
    return adjustBalance(name, amount, 'Cargar');
}

async function withdraw(name, amount) {
    return adjustBalance(name, amount, 'Descargar');
}

/**
 * Desbloquea un usuario (quita la clase "active" del switch).
 */
async function unlockUser(name) {
    const { browser, page } = await initBrowser();
    try {
        await goToUser(page, name);

        const switchSelector =
            '#app > div > div.main > div.account-cards > div.general-cards-grid > div > div > div.table-wrapper.block > table > tbody > tr:nth-child(1) > td:nth-child(5) > div';

        // Esperar a que aparezca el switch
        await page.waitForSelector(switchSelector, { timeout: 10000 });

        // Ver si está "active"
        const isActive = await page.$eval(switchSelector, el =>
            el.classList.contains('active')
        );

        if (isActive) {
            await page.click(switchSelector);
            await new Promise(r => setTimeout(r, 4000)); // espera a que procese
            return 'ok';
        } else {
            return 'already_unlocked';
        }
    } catch (error) {
        console.error(error);
        return 'error';
    } finally {
        await browser.close();
    }
}

/**
 * Cambia la contraseña a "cambiar123".
 */
async function changePassword(name) {
    const { browser, page } = await initBrowser();
    try {
        await goToUser(page, name);
        await clickVisible(page, '#app > div > div.main > div.account-cards > div.general-cards-grid > div > div > div.table-wrapper.block > table > tbody > tr:nth-child(1) > td.td-actions > div');
        await clickVisible(page, '#app > div > div.main > div.account-cards > div.overlay > div > div:nth-child(2) > div > div.block.nav > div:nth-child(2)');
        await typeVisible(page, '#app > div > div.main > div.account-cards > div.overlay > div > div:nth-child(2) > div > div.content > form:nth-child(2) > div > label:nth-child(1) > input[type=password]', 'cambiar123');
        await typeVisible(page, '#app > div > div.main > div.account-cards > div.overlay > div > div:nth-child(2) > div > div.content > form:nth-child(2) > div > label:nth-child(2) > input[type=password]', 'cambiar123');
        await clickVisible(page, '#app > div > div.main > div.account-cards > div.overlay > div > div:nth-child(2) > div > div.content > form:nth-child(2) > button');
        return 'ok';
    } catch (error) {
        console.error(error);
        return 'error';
    } finally {
        await browser.close();
    }
}

module.exports = {
    createUser,
    deposit,
    withdraw,
    unlockUser,
    changePassword,
};
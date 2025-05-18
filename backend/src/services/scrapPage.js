const puppeteer = require('puppeteer');
const {
    LAUNCH_OPTIONS,
    PAGINA_PANEL_ADMIN,
    PAGINA_USER_ADMIN,
    PAGINA_PASS_ADMIN,
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
    await page.goto(PAGINA_PANEL_ADMIN, { waitUntil: 'load' });
    await typeVisible(page, '#user', PAGINA_USER_ADMIN);
    await typeVisible(page, '#passwd', PAGINA_PASS_ADMIN);
    await Promise.all([
        clickVisible(page, '#dologin'),
        page.waitForNavigation({ waitUntil: 'load' }),
    ]);

    return { browser, page };
}

/**
 * Navega al listado de usuarios y busca por name.
 */
async function goToUser(page, name) {
    await page.goto(`${PAGINA_PANEL_ADMIN}/users.php`, { waitUntil: 'load' });
    await typeVisible(page, '#UserSearch', name);
    await clickVisible(page, '#UserSearchButton');
    await page.waitForTimeout(3000);
}

/**
 * Crea un usuario y devuelve 'ok' | 'taken' | 'error'.
 */
async function createUser(name) {
    const { browser, page } = await initBrowser();
    try {
        // Prepara la escucha de la respuesta
        const creation = page.waitForResponse(r =>
            r.url().endsWith('operation_create_user.php')
        );

        await clickVisible(page, '#NewPlayerButton');
        await typeVisible(page, '#NewUserPlayername', name);
        await typeVisible(page, '#NewUserPlayerPassword', 'cambiar123');

        await Promise.all([
            clickVisible(page, '#ModalNewUserPlayerSubmit'),
            creation,
        ]);

        const response = await creation;
        return response.status() === 200 ? 'ok' : 'taken';
    } catch (error) {
        console.error(error);
        return 'error';
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

        // Si está bloqueado, desbloquea
        const unlockBtn = await page.$('a[title="Desbloquear"]');
        if (unlockBtn) {
            await unlockBtn.click();
            await page.waitForTimeout(2000);
        }

        // Para 'Descargar', chequea saldo disponible
        if (action === 'Descargar') {
            const saldoText = await page.$eval(
                'td.font-weight-bold ~ .users-row-balance',
                el => el.textContent
            );
            const saldo = parseFloat(formatNumber(saldoText));
            const retiro = parseFloat(amount.replace(',', '.'));
            if (retiro > saldo) {
                await browser.close();
                return 'insufficient';
            }
        }

        // Click en cargar o descargar
        const selector =
            action === 'Cargar'
                ? 'a[title="Cargar Fichas"]'
                : 'a[alt="Descargar Fichas"]';
        await clickVisible(page, selector);

        // Ingreso de monto
        await typeVisible(page, '#ModalCreditAmount', amount);
        await clickVisible(page, '#ModalCreditSubmit');

        // Si es retiro, verifica en el historial
        if (action === 'Descargar') {
            await Promise.all([
                page.waitForNavigation(),
                page.goto(`${PAGINA_PANEL_ADMIN}/report_balances.php`, {
                    waitUntil: 'load',
                }),
            ]);
            await typeVisible(page, '#UserSearch', name);
            await clickVisible(page, '#search');
            await page.waitForSelector(
                '#history tbody tr:first-child .dt-amount',
                { visible: true }
            );
            const text = await page.$eval(
                '#history tbody tr:first-child .dt-amount',
                el => el.textContent
            );
            const recheck = parseFloat(formatNumber(text)) * -1;
            const expected = parseFloat(amount.replace(',', '.'));
            await new Promise(resolve => setTimeout(resolve, 10000));

            await browser.close();
            return recheck === expected ? 'ok' : 'insufficient';
        }

        await new Promise(resolve => setTimeout(resolve, 10000));

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
 * Desbloquea un usuario (click en “Desbloquear”).
 */
async function desbloquear(name) {
    const { browser, page } = await initBrowser();
    try {
        await goToUser(page, name);
        const btn = await page.$('a[title="Desbloquear"]');
        if (btn) await btn.click();
        return 'ok';
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
        await clickVisible(page, 'a[title="Cambiar Contraseña"]');
        await typeVisible(page, '#ChangePasswordNew1', 'cambiar123');
        await typeVisible(page, '#ChangePasswordNew2', 'cambiar123');
        await clickVisible(page, '#ModalChangePasswordSubmit');
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
    desbloquear,
    changePassword,
};

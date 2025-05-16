const puppeteer = require('puppeteer');
const { LAUNCH_OPTIONS, PAGINA_PANEL_ADMIN, PAGINA_USER_ADMIN, PAGINA_PASS_ADMIN } = require('../constantes');

// Utility: formats numbers like '1.234,56' to '1234,56'
function formatNumber(numberStr) {
    const normalized = numberStr.replace(/\./g, '').replace(',', '.');
    return normalized;
}

// Encapsulate browser lifecycle: open page, login, return {browser, page}
async function initBrowser() {
    const browser = await puppeteer.launch(LAUNCH_OPTIONS);
    const [page] = await browser.pages();
    page.setDefaultTimeout(60000);
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(PAGINA_PANEL_ADMIN, { waitUntil: 'load' });
    await page.type('#user', PAGINA_USER_ADMIN);
    await page.type('#passwd', PAGINA_PASS_ADMIN);
    await Promise.all([page.click('#dologin'), page.waitForNavigation({ waitUntil: 'load' })]);

    return { browser, page };
}

// Generic: navigate to users listing and search by username
async function goToUser(page, username) {
    await page.goto(`${PAGINA_PANEL_ADMIN}/users.php`, { waitUntil: 'load' });
    await page.type('#UserSearch', username);
    await page.click('#UserSearchButton');
    await page.waitForTimeout(3000);
}

// Create a new user; resolves { username } or throws Error('taken')
async function crearUsuario(username) {
    const { browser, page } = await initBrowser();
    try {
        // Listen for response
        const creation = page.waitForResponse(response =>
            response.url().endsWith('operation_create_user.php')
        );

        await page.click('#NewPlayerButton');
        await page.waitForSelector('#NewUserPlayerUsername');
        await page.type('#NewUserPlayerUsername', username);
        await page.type('#NewUserPlayerPassword', 'cambiar123');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Promise.all([
            page.click('#ModalNewUserPlayerSubmit'),
            creation
        ]);

        const response = await creation;
        if (response.status() === 200) {
            return 'ok';
        } else {
            return 'taken';
        }
    } catch (error) {
        console.log(error);
        return 'error';
    } finally {
        await browser.close();
    }
}

async function ajustarSaldo(username, amount, action) {
    const { browser, page } = await initBrowser();
    try {
        // 1. Navegar y buscar el usuario
        await goToUser(page, username);

        // 2. Desbloquear si está bloqueado
        const unlockBtn = await page.$('a[title="Desbloquear"]');
        if (unlockBtn) {
            await unlockBtn.click();
            // opcional: esperar a que desaparezca el modal de desbloqueo
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 3. Si es retiro, chequeamos saldo antes
        if (action === 'Descargar') {
            const saldoText = await page.$eval(
                'td.font-weight-bold ~ .users-row-balance',
                el => el.textContent
            );
            const saldo = parseFloat(formatNumber(saldoText));
            const retiro = parseFloat(amount.replace(',', '.'));
            if (retiro > saldo) {
                await browser.close();
                return 'faltante';
            }
        }

        // 4. Ejecutar carga o retiro
        const selector = action === 'Cargar'
            ? 'a[title="Cargar Fichas"]'
            : 'a[alt="Descargar Fichas"]';

        await page.click(selector);
        await page.waitForSelector('#ModalCreditAmount', { visible: true });
        await page.type('#ModalCreditAmount', amount);
        await page.click('#ModalCreditSubmit');

        // 5. En caso de retiro, verificamos en el historial
        if (action === 'Descargar') {
            // navegar al reporte de balances
            await Promise.all([
                page.waitForNavigation(),
                page.goto(`${PAGINA_PANEL_ADMIN}/report_balances.php`, { waitUntil: 'load' }),
            ]);
            await page.waitForSelector('#UserSearch', { visible: true });
            await page.type('#UserSearch', username);
            await page.click('#search');
            await page.waitForSelector('#history tbody tr:first-child .dt-amount', { visible: true });

            const text = await page.$eval(
                '#history tbody tr:first-child .dt-amount',
                el => el.textContent
            );
            const recheck = parseFloat(formatNumber(text)) * -1;
            const expected = parseFloat(amount.replace(',', '.'));

            await browser.close();
            return recheck === expected ? 'ok' : 'faltante';
        }

        // 6. En caso de carga
        await browser.close();
        return 'ok';

    } catch (err) {
        console.error(err);
        await browser.close();
        return 'error';
    }
}

async function cargar(username, amount) {
    return ajustarSaldo(username, amount, 'Cargar');
}

async function retirar(username, amount) {
    return ajustarSaldo(username, amount, 'Descargar');
}

// Simple unblock: returns 'ok'
async function desbloquear(username) {
    const { browser, page } = await initBrowser();
    try {
        await goToUser(page, username);
        const btn = await page.$('a[title="Desbloquear"]');
        if (btn) await btn.click();
        return 'ok';
    } catch (error) {
        console.log(error);
        return 'error';
    } finally {
        await browser.close();
    }
}

// Change password: returns 'ok'
async function cambiarContrasena(username) {
    const { browser, page } = await initBrowser();
    try {
        await goToUser(page, username);
        await page.click('a[title="Cambiar Contraseña"]');
        await page.waitForSelector('#ChangePasswordNew1');
        await page.type('#ChangePasswordNew1', 'cambiar123');
        await page.type('#ChangePasswordNew2', 'cambiar123');
        await page.click('#ModalChangePasswordSubmit');
        return 'ok';
    } catch (error) {
        console.log(error);
        return 'error';
    } finally {
        await browser.close();
    }
}

module.exports = {
    crearUsuario,
    cargar,
    retirar,
    desbloquear,
    cambiarContrasena
};

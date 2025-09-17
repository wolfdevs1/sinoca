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
};

/**
 * Espera a que el selector sea visible y hace click.
 * @param {import('puppeteer').Page} page
 * @param {string} selector
 */

async function clickVisible(page, selector) {
    await page.waitForSelector(selector, { visible: true });
    await page.click(selector);
};

/**
 * Espera a que el selector sea visible y teclea el texto.
 * @param {import('puppeteer').Page} page
 * @param {string} selector
 * @param {string} text
 */
async function typeVisible(page, selector, text) {
    await page.waitForSelector(selector, { visible: true });
    await page.type(selector, text);
};

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
    await typeVisible(page, '#root > div > section > div > div.auth__form > div:nth-child(1) > input', getPanelUser());
    await typeVisible(page, '#root > div > section > div > div.auth__form > div:nth-child(2) > div.input__wrapper > input', getPanelPassword());
    await clickVisible(page, '#root > div > section > div > div.auth__form > div.auth__button > button');
    await new Promise(r => setTimeout(r, 2000)); // espera extra a que cargue todo
    return { browser, page };
};

/**
 * Navega al listado de usuarios y busca por name.
 */
async function goToUser(page, name) {
    //await page.goto(`${PAGINA_PANEL_ADMIN}`, { waitUntil: 'load' });
    await typeVisible(page, '#root > div > div.app__wrapper > main > div.app__wrapper__content > div.users > div.users__filter > form > div:nth-child(1) > div.search-user-input > div > input', name);
    await clickVisible(page, '#root > div > div.app__wrapper > main > div.app__wrapper__content > div.users > div.users__filter > form > div:nth-child(5) > div.users-filter-block-desktop__button > button');
    await new Promise(r => setTimeout(r, 3000)); // espera a que cargue el filtro
};

/**
 * Crea un usuario y devuelve:
 *  - { status: 'ok', user: 'S962.019258' } si se creó y aparece el modal
 *  - { status: 'taken' } si no aparece modal
 *  - { status: 'error' } en caso de excepción
 */
async function createUser(name) {
    const { browser, page } = await initBrowser();
    try {
        const btnCrear = '#root > div > div.app__wrapper > main > div.subheader > div.subheader__buttons > a.button.button_sizable_default.button_colors_transparent';
        const inputUser = '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > form > div.create-player__fields > div:nth-child(1) > div > input';
        const inputPass = '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > form > div.create-player__fields > div:nth-child(3) > div > div > input';
        const inputPass2 = '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > form > div.create-player__fields > div:nth-child(5) > div > div > input';
        const btnSubmit = '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > form > div.create-player__bottom > button.button.button_sizable_low.button_colors_default';
        const btnSubmit2 = '#modal-root > div > div > div > div > div.create-player__confirmation-pop-up__buttons > button.button.button_sizable_low.button_colors_transparent';

        const URL_SUCCESS = 'https://agents.ganamos.io/users/all';
        const URL_CREATE = 'https://agents.ganamos.io/user/create-player';

        // Flujo de creación
        await clickVisible(page, btnCrear);
        await typeVisible(page, inputUser, name);
        await typeVisible(page, inputPass, 'cambiar123');
        await typeVisible(page, inputPass2, 'cambiar123');
        await clickVisible(page, btnSubmit);
        await clickVisible(page, btnSubmit2);

        // Esperar 2 segundos
        await new Promise(r => setTimeout(r, 2000));

        const currentUrl = page.url();
        if (currentUrl === URL_SUCCESS) {
            return name;
        } else if (currentUrl === URL_CREATE) {
            return 'taken';
        }

    } catch (e) {
        console.error(e);
        return 'error';
    } finally {
        await browser.close();
    }
};

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
            '#root > div > div.app__wrapper > main > div.app__wrapper__content > div.users > div.users-table.users-table_tab_all > div.users-table__table > div.users-table__tbody > div > div:nth-child(1) > div > div.adm-bets-table-row-user__td-data-user > span';

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
                '#root > div > div.app__wrapper > main > div.app__wrapper__content > div.users > div.users-table.users-table_tab_all > div.users-table__table > div.users-table__tbody > div > div:nth-child(2)',
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
            await clickVisible(
                page,
                '#root > div > div.app__wrapper > main > div.app__wrapper__content > div.users > div.users-table.users-table_tab_all > div.users-table__table > div.users-table__tbody > div > div:nth-child(3) > div > a.button.button_sizable_default.button_colors_default'
            );
            await typeVisible(
                page,
                '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > div > div.deposit__top > div.deposit__inputs > div:nth-child(1) > div > div > div > div > input',
                amount
            );
            await clickVisible(
                page,
                '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > div > div.deposit__bottom > button.button.button_sizable_low.button_colors_default'
            );
        } else {
            await clickVisible(
                page,
                '#root > div > div.app__wrapper > main > div.app__wrapper__content > div.users > div.users-table.users-table_tab_all > div.users-table__table > div.users-table__tbody > div > div:nth-child(3) > div > a.button.button_sizable_default.button_colors_full-transparent'
            );
            await typeVisible(
                page,
                '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > div > div.withdrawal__top > div.withdrawal__input-block > div > div.input__wrapper > input',
                amount
            );
            await clickVisible(
                page,
                '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > div > div.withdrawal__bottom > button.button.button_sizable_low.button_colors_default'
            );
        }

        await new Promise(r => setTimeout(r, 2000)); // espera a que procese

        await browser.close();
        return 'ok';

    } catch (err) {
        console.error(err);
        await browser.close();
        return 'error';
    }
};

async function deposit(name, amount) {
    return adjustBalance(name, amount, 'Cargar');
};

async function withdraw(name, amount) {
    return adjustBalance(name, amount, 'Descargar');
};

/**
 * Desbloquea un usuario (quita la clase "active" del switch).
 */
async function unlockUser(name) {
    return 'ok';
};

/**
 * Cambia la contraseña a "cambiar123".
 */
async function changePassword(name) {
    const { browser, page } = await initBrowser();
    try {
        await goToUser(page, name);
        await clickVisible(page, '#root > div > div.app__wrapper > main > div.app__wrapper__content > div.users > div.users-table.users-table_tab_all > div.users-table__table > div.users-table__tbody > div:nth-child(1) > div:nth-child(6) > div > div');
        await clickVisible(page, '#root > div > div.app__wrapper > main > div.app__wrapper__content > div.users > div.users-table.users-table_tab_all > div.users-table__table > div.users-table__tbody > div:nth-child(1) > div:nth-child(6) > div > div > ul > a:nth-child(3)');
        await typeVisible(page, '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > form > div.change-password-users__top > div.change-password-users__fields > div:nth-child(1) > div > div > input', 'cambiar123');
        await typeVisible(page, '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > form > div.change-password-users__top > div.change-password-users__fields > div:nth-child(2) > div > div > input', 'cambiar123');
        await clickVisible(page, '#root > div > div.app__wrapper > main > div.app__wrapper__content > div > form > div.change-password-users__bottom > button.button.button_sizable_low.button_colors_default');
        return 'ok';
    } catch (error) {
        console.error(error);
        return 'error';
    } finally {
        await browser.close();
    }
};

module.exports = {
    createUser,
    deposit,
    withdraw,
    unlockUser,
    changePassword,
};

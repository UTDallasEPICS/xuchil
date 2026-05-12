import { initDriver, quitDriver, navigateTo } from '../config';
import BrowserHelper from '../helpers/browser';
import { Selectors } from '../helpers/selectors';
import { loginAsAdmin } from '../helpers/session';

describe('Gestión de Órdenes', () => {
  let browser: BrowserHelper;
  const formatToday = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  before(async function () {
    this.timeout(20000);
    await initDriver();
    browser = new BrowserHelper();
    
    await loginAsAdmin(browser);
  });

  after(async function () {
    this.timeout(10000);
    await quitDriver();
  });

  it('Debería crear una nueva orden', async function () {
    this.timeout(15000);

    await navigateTo('/orders/deliveries/new-order');

    await browser.waitForElementVisible(Selectors.page.heading);
    await browser.typeText('//textarea[contains(@placeholder, "Nombre del cliente")]', 'Cliente Selenium');
    await browser.typeText('//input[contains(@placeholder, "Dirección completa")]', 'Calle Prueba 123');

    const dateButton = await browser.findElement(`//button[contains(., "${formatToday()}")]`);
    await dateButton.click();
    await browser.pause(500);

    const dayButton = await browser.findElement('//div[contains(@class, "react-datepicker__day--today")]');
    await dayButton.click();

    await browser.click('//button[contains(text(), "Finalizar registro")]');

    // Esperar a que se complete la creación
    await browser.pause(2000);

    await browser.waitForElementVisible(Selectors.orders.orderRows, 5000);
  });

  it('Debería listar órdenes creadas', async function () {
    this.timeout(15000);

    await navigateTo('/orders/deliveries');
    await browser.waitForElementVisible(Selectors.page.heading);

    const rows = await browser.findElements(Selectors.orders.orderRows);

    if (rows.length === 0) {
      throw new Error('No hay órdenes en la tabla');
    }

    // Verificar que cada fila tiene número de orden y estado
    for (const row of rows) {
      const orderNumber = await row.findElement({ css: Selectors.orders.orderNumber });
      const status = await row.findElement({ css: Selectors.orders.status });

      const orderText = await orderNumber.getText();
      const statusText = await status.getText();

      if (!orderText || !statusText) {
        throw new Error('Fila de orden incompleta');
      }
    }
  });

  it('Debería filtrar órdenes por estado', async function () {
    this.timeout(15000);

    await navigateTo('/orders/deliveries');
    await browser.waitForElementVisible(Selectors.page.heading);

    const rows = await browser.findElements(Selectors.orders.orderRows);

    if (rows.length > 0) {
      for (const row of rows) {
        const status = await row.findElement({ css: Selectors.orders.status });
        const statusText = await status.getText();

        if (!statusText.toLowerCase().includes('pedido') && !statusText.toLowerCase().includes('entrega')) {
          throw new Error(`Se encontró una orden con estado no filtrado: ${statusText}`);
        }
      }
    }
  });

  it('Debería completar un flujo de orden completo', async function () {
    this.timeout(30000);

    await navigateTo('/orders/deliveries/new-order');
    await browser.waitForElementVisible(Selectors.page.heading);

    await browser.typeText('//textarea[contains(@placeholder, "Nombre del cliente")]', `Cliente ${Date.now()}`);
    await browser.typeText('//input[contains(@placeholder, "Dirección completa")]', 'Calle Prueba 123');

    const dateButton = await browser.findElement(`//button[contains(., "${formatToday()}")]`);
    await dateButton.click();
    await browser.pause(500);

    const dayButton = await browser.findElement('//button[contains(@aria-label, "Choose")]');
    await dayButton.click();

    const submitButton = await browser.findElement('//button[contains(text(), "Finalizar registro")]');
    await submitButton.click();
    await browser.pause(2000);

    await navigateTo('/orders/deliveries');
    await browser.pause(1000);

    // 6. Verificar que aparece en la lista
    const rows = await browser.findElements(Selectors.orders.orderRows);
    if (rows.length === 0) {
      throw new Error('La orden creada no aparece en la lista');
    }
  });
});

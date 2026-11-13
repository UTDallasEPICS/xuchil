import { initDriver, quitDriver, navigateTo } from '../config.ts';
import BrowserHelper from '../helpers/browser.ts';
import { loginAsAdmin } from '../helpers/session.ts';

describe('Módulo de Inventario', () => {
  let browser: BrowserHelper;

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

  it('TC-INV-001: debería mostrar la lista de productos', async function () {
    this.timeout(15000);

    await navigateTo('/inventory/products');
    await browser.waitForElementVisible('input[placeholder="Buscar elementos"]');

    const productImages = await browser.findElements('img[alt]');
    if (productImages.length === 0) {
      throw new Error('No se encontraron productos en el inventario');
    }
  });

  it('TC-INV-002: debería abrir el detalle de un producto', async function () {
    this.timeout(15000);

    await navigateTo('/inventory/products');
    await browser.waitForElementVisible('input[placeholder="Buscar elementos"]');

    const productImages = await browser.findElements('img[alt]');
    if (productImages.length === 0) {
      throw new Error('No hay productos disponibles para consultar su detalle');
    }

    await productImages[0].click();
    await browser.waitForElementVisible('h1');
    await browser.assertPageContains('En inventario:');

    const currentUrl = await browser.getCurrentUrl();
    if (!currentUrl.includes('/inventory/details/')) {
      throw new Error(`La navegación no llegó al detalle: ${currentUrl}`);
    }

    await browser.waitForElementVisible('input[placeholder="Cantidad"]');
    await browser.waitForElementVisible('select');
    await browser.assertPageContains('Agregar stock');
  });

  it('TC-INV-003: debería rechazar stock negativo', async function () {
    this.timeout(15000);

    await navigateTo('/inventory/new-raw-material');
    await browser.waitForElementVisible('h1');

    await browser.typeText('input[placeholder="Ej. MP009"]', `MP-TEST-${Date.now()}`);
    await browser.typeText('input[placeholder="Ej. Harina de trigo"]', 'Materia prima de prueba');
    await browser.typeText('#stock', '-1');
    await browser.click('//button[contains(., "Registrar materia prima")]');

    await browser.assertPageContains('El stock no puede ser negativo.');
    const currentUrl = await browser.getCurrentUrl();
    if (!currentUrl.includes('/inventory/new-raw-material')) {
      throw new Error('El formulario avanzó a pesar de recibir stock negativo');
    }
  });

  it('TC-INV-004: debería generar un código para una nueva materia prima', async function () {
    this.timeout(15000);

    await navigateTo('/inventory/new-raw-material');
    await browser.waitForElementVisible('input[placeholder="Ej. MP009"]');
    await browser.click('//button[contains(., "Generar")]');

    const generatedCode = await browser.getAttribute(
      'input[placeholder="Ej. MP009"]',
      'value'
    );

    if (!generatedCode || generatedCode.trim().length === 0) {
      throw new Error('No se generó un código para la materia prima');
    }
  });
});
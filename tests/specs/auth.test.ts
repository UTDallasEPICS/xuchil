import { initDriver, quitDriver, navigateTo } from '../config';
import BrowserHelper from '../helpers/browser';
import { Selectors } from '../helpers/selectors';
import { loginAsAdmin } from '../helpers/session';

describe('Autenticación y Login', () => {
  let browser: BrowserHelper;

  before(async function () {
    this.timeout(20000);
    await initDriver();
    browser = new BrowserHelper();
  });

  after(async function () {
    this.timeout(10000);
    await quitDriver();
  });

  it('Debería realizar login con credenciales válidas', async function () {
    this.timeout(15000);

    // Navegar a la página de login
    await navigateTo('/login');

    // Esperar a que se cargue el formulario
    await browser.waitForElementVisible(Selectors.login.emailInput);

    // Llenar el formulario
    await browser.typeText(Selectors.login.emailInput, 'admin@xuchil.com');
    await browser.typeText(Selectors.login.passwordInput, 'Admin123');

    // Hacer clic en el botón de envío
    await browser.click(Selectors.login.submitButton);

    // Esperar a que se redirija a la página principal
    await browser.pause(2000); // Pequeña pausa para que se complete la redirección
    const currentUrl = await browser.getCurrentUrl();
    
    if (!currentUrl.includes('/')) {
      throw new Error('No se redirigió correctamente después del login');
    }
  });

  it('Debería mostrar error con credenciales inválidas', async function () {
    this.timeout(15000);

    // Navegar a la página de login
    await navigateTo('/login');

    // Esperar a que se cargue el formulario
    await browser.waitForElementVisible(Selectors.login.emailInput);

    // Llenar con credenciales incorrectas
    await browser.typeText(Selectors.login.emailInput, 'usuario@invalido.com');
    await browser.typeText(Selectors.login.passwordInput, 'contraseña_incorrecta');

    // Hacer clic en el botón de envío
    await browser.click(Selectors.login.submitButton);

    // Esperar a que aparezca el mensaje de error
    await browser.pause(1000);
    const errorText = await browser.getText(Selectors.login.errorMessage);

    if (!errorText || errorText.length === 0) {
      throw new Error('No se mostró mensaje de error');
    }
  });

  it('Debería cerrar sesión correctamente', async function () {
    this.timeout(15000);

    await loginAsAdmin(browser);

    await browser.executeScript(
      "return fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })"
    );

    // Esperar a que se redirija a login
    await navigateTo('/user');
    await browser.waitForElementVisible(Selectors.login.emailInput, 10000);
  });
});

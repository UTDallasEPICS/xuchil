import { initDriver, quitDriver, navigateTo } from '../config';
import BrowserHelper from '../helpers/browser';
import { Selectors } from '../helpers/selectors';
import { loginAsAdmin } from '../helpers/session';

describe('Gestión de Usuarios', () => {
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

  it('Debería crear un nuevo usuario', async function () {
    this.timeout(15000);

    // Navegar a la página de crear usuario
    await navigateTo('/create_user');

    // Esperar a que se cargue el formulario
    await browser.waitForElementVisible(Selectors.userForm.nameInput);

    // Llenar el formulario
    const timestamp = Date.now();
    const email = `usuario${timestamp}@xuchil.com`;
    const username = `usuario${timestamp}`;

    await browser.typeText(Selectors.userForm.nameInput, 'Juan');
    await browser.typeText(Selectors.userForm.lastNameInput, 'Pérez');
    await browser.typeText(Selectors.userForm.secondLastNameInput, 'Gómez');
    await browser.typeText(Selectors.userForm.phoneInput, '5512345678');
    await browser.typeText(Selectors.userForm.emailInput, email);
    await browser.typeText(Selectors.userForm.usernameInput, username);
    await browser.typeText(Selectors.userForm.passwordInput, 'Usuario123');
    await browser.typeText(Selectors.userForm.confirmPasswordInput, 'Usuario123');

    // Enviar el formulario
    await browser.pause(500);
    await browser.click(Selectors.userForm.submitButton);

    // Esperar a que se complete la creación
    await browser.pause(2000);

    // Verificar que se mostró un mensaje de éxito
    try {
      await browser.waitForElementVisible(Selectors.notification.success, 5000);
    } catch (error) {
      throw new Error('No se mostró mensaje de éxito después de crear usuario');
    }
  });

  it('Debería listar usuarios creados', async function () {
    this.timeout(15000);

    await navigateTo('/user');

    await browser.waitForElementVisible(Selectors.header.logoutButton);
    await browser.assertPageContains('Perfil de usuario');
  });

  it('Debería editar un usuario existente', async function () {
    this.timeout(15000);

    await navigateTo('/edit_user');

    await browser.waitForElementVisible(Selectors.userForm.nameInput);
    await browser.clearField(Selectors.userForm.nameInput);
    await browser.typeText(Selectors.userForm.nameInput, 'Nombre Actualizado');
    await browser.click(Selectors.userForm.submitButton);

    // Esperar a que se complete la actualización
    await browser.pause(2000);

    // Verificar que se mostró un mensaje de éxito
    try {
      await browser.waitForElementVisible(Selectors.notification.success, 5000);
    } catch (error) {
      throw new Error('No se mostró mensaje de éxito después de editar usuario');
    }
  });
});

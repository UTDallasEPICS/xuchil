/**
 * Utilidades avanzadas para pruebas
 * Funciones helper adicionales para escenarios complejos
 */

import BrowserHelper from './browser';
import { Selectors } from './selectors';

export class TestUtils {
  constructor(private browser: BrowserHelper) {}

  /**
   * Realiza login completo
   */
  async login(email: string, password: string): Promise<void> {
    await this.browser.typeText(Selectors.login.emailInput, email);
    await this.browser.typeText(Selectors.login.passwordInput, password);
    await this.browser.click(Selectors.login.submitButton);
    await this.browser.pause(2000);
  }

  /**
   * Realiza logout
   */
  async logout(): Promise<void> {
    await this.browser.click(Selectors.header.logoutButton);
    await this.browser.pause(2000);
  }

  /**
   * Espera a que un formulario tenga éxito (mensaje de éxito visible)
   */
  async waitForSuccessMessage(timeout: number = 5000): Promise<void> {
    try {
      await this.browser.waitForElementVisible(Selectors.notification.success, timeout);
    } catch (error) {
      throw new Error('No se mostró mensaje de éxito después de la acción');
    }
  }

  /**
   * Espera a que aparezca un mensaje de error
   */
  async waitForErrorMessage(timeout: number = 5000): Promise<void> {
    try {
      await this.browser.waitForElementVisible(Selectors.notification.error, timeout);
    } catch (error) {
      throw new Error('No se mostró mensaje de error');
    }
  }

  /**
   * Rellena un formulario de usuario
   */
  async fillUserForm(data: { name: string; email: string; role?: string }): Promise<void> {
    await this.browser.waitForElementVisible(Selectors.userForm.nameInput);
    
    await this.browser.typeText(Selectors.userForm.nameInput, data.name);
    await this.browser.typeText(Selectors.userForm.emailInput, data.email);
    
    if (data.role) {
      await this.browser.selectOption(Selectors.userForm.roleSelect, data.role);
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(name: string, email: string, role: string = 'user'): Promise<void> {
    await this.fillUserForm({ name, email, role });
    await this.browser.click(Selectors.userForm.submitButton);
    await this.waitForSuccessMessage();
  }

  /**
   * Rellena formulario de producto/inventario
   */
  async addProduct(name: string, quantity: string, unit: string = 'kg'): Promise<void> {
    await this.browser.typeText(Selectors.inventory.productInput, name);
    await this.browser.typeText(Selectors.inventory.quantityInput, quantity);
    await this.browser.selectOption(Selectors.inventory.unitSelect, unit);
    await this.browser.click(Selectors.inventory.addButton);
    await this.browser.pause(500);
  }

  /**
   * Obtiene el número de filas en una tabla
   */
  async getTableRowCount(): Promise<number> {
    const rows = await this.browser.findElements(Selectors.orders.orderRows);
    return rows.length;
  }

  /**
   * Verifica que un elemento contiene un texto específico
   */
  async assertElementContainsText(selector: string, expectedText: string): Promise<void> {
    const text = await this.browser.getText(selector);
    if (!text.includes(expectedText)) {
      throw new Error(`Texto esperado "${expectedText}" no encontrado en "${text}"`);
    }
  }

  /**
   * Verifica que la página contiene un texto
   */
  async assertPageContains(text: string): Promise<void> {
    const pageSource = await this.browser.executeScript<string>('return document.body.innerText');
    if (!pageSource.includes(text)) {
      throw new Error(`Texto "${text}" no encontrado en la página`);
    }
  }

  /**
   * Espera a que la URL cambie
   */
  async waitForUrlChange(previousUrl: string, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const currentUrl = await this.browser.getCurrentUrl();
      if (currentUrl !== previousUrl) {
        return;
      }
      await this.browser.pause(100);
    }
    throw new Error('La URL no cambió dentro del tiempo esperado');
  }

  /**
   * Limpia una tabla (útil para resetear datos de prueba)
   */
  async clearTableRows(): Promise<void> {
    const rows = await this.browser.findElements(Selectors.orders.orderRows);
    
    for (const row of rows) {
      try {
        const deleteButton = await row.findElement({ css: '[data-testid="delete-button"]' });
        await deleteButton.click();
        
        // Confirmar eliminación si hay un modal
        try {
          const confirmButton = await this.browser.findElement(Selectors.modal.confirmButton);
          await confirmButton.click();
          await this.browser.pause(500);
        } catch (e) {
          // No hay modal
        }
      } catch (e) {
        // No hay botón de eliminar
      }
    }
  }

  /**
   * Toma captura de pantalla con timestamp
   */
  async takeTimestampedScreenshot(testName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${testName}-${timestamp}`;
    // await this.browser.takeScreenshot(filename); // Descomenta para usar
    console.log(`📸 Captura: ${filename}`);
  }

  /**
   * Valida que un campo tiene un valor específico
   */
  async assertFieldValue(selector: string, expectedValue: string): Promise<void> {
    const value = await this.browser.getAttribute(selector, 'value');
    if (value !== expectedValue) {
      throw new Error(`Campo tiene valor "${value}", esperado "${expectedValue}"`);
    }
  }

  /**
   * Espera a que un elemento sea clickeable (visible e interactuable)
   */
  async waitForElementClickable(selector: string, timeout: number = 10000): Promise<void> {
    await this.browser.waitForElementVisible(selector, timeout);
    // Pequeña pausa para asegurar que está totalmente interactivo
    await this.browser.pause(200);
  }

  /**
   * Realiza un flujo completo de login y espera a estar en la página principal
   */
  async loginAndWaitForDashboard(email: string, password: string): Promise<void> {
    const previousUrl = await this.browser.getCurrentUrl();
    await this.login(email, password);
    await this.waitForUrlChange(previousUrl);
    
    // Esperar a que cargue el dashboard
    await this.browser.pause(1000);
  }

  /**
   * Cierra modales si están abiertos
   */
  async closeModalsIfOpen(): Promise<void> {
    try {
      const closeButton = await this.browser.findElement(Selectors.modal.closeButton);
      await closeButton.click();
      await this.browser.pause(300);
    } catch (e) {
      // No hay modal abierto
    }
  }
}

export default TestUtils;

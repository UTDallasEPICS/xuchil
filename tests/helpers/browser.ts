import { WebDriver, By, WebElement, until } from 'selenium-webdriver';
import { getDriver } from '../config';

export class BrowserHelper {
  private driver: WebDriver;

  constructor() {
    this.driver = getDriver();
  }

  /**
   * Espera a que un elemento esté presente
   */
  private getLocator(selector: string) {
    if (selector.startsWith('//') || selector.startsWith('(')) {
      return By.xpath(selector);
    }

    return By.css(selector);
  }

  async waitForElement(selector: string, timeout?: number): Promise<WebElement> {
    const duration = timeout || 10000;
    return this.driver.wait(
      until.elementLocated(this.getLocator(selector)),
      duration,
      `Elemento no encontrado: ${selector}`
    );
  }

  /**
   * Encuentra un elemento
   */
  async findElement(selector: string): Promise<WebElement> {
    return this.driver.findElement(this.getLocator(selector));
  }

  /**
   * Encuentra múltiples elementos
   */
  async findElements(selector: string): Promise<WebElement[]> {
    return this.driver.findElements(this.getLocator(selector));
  }

  /**
   * Escribe texto en un campo
   */
  async typeText(selector: string, text: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.clear();
    await element.sendKeys(text);
  }

  /**
   * Hace clic en un elemento
   */
  async click(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.click();
  }

  /**
   * Obtiene el texto de un elemento
   */
  async getText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    return element.getText();
  }

  /**
   * Obtiene el valor de un atributo
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    const element = await this.findElement(selector);
    return element.getAttribute(attribute);
  }

  /**
   * Verifica que la página contenga un texto
   */
  async assertPageContains(text: string): Promise<void> {
    const pageText = await this.executeScript<string>('return document.body.innerText');
    if (!pageText.includes(text)) {
      throw new Error(`Texto "${text}" no encontrado en la página`);
    }
  }


  /**
   * Espera a que un elemento sea visible
   */
  async waitForElementVisible(selector: string, timeout?: number): Promise<void> {
    const duration = timeout || 10000;
    const element = await this.waitForElement(selector, duration);
    await this.driver.wait(until.elementIsVisible(element), duration);
  }

  /**
   * Espera a que un elemento desaparezca
   */
  async waitForElementNotPresent(selector: string, timeout?: number): Promise<void> {
    const duration = timeout || 10000;
    await this.driver.wait(
      until.stalenessOf(await this.findElement(selector)),
      duration,
      `Elemento aún visible: ${selector}`
    );
  }

  /**
   * Obtiene el título de la página
   */
  async getPageTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  /**
   * Obtiene la URL actual
   */
  async getCurrentUrl(): Promise<string> {
    return this.driver.getCurrentUrl();
  }

  /**
   * Ejecuta JavaScript en el navegador
   */
  async executeScript<T>(script: string, ...args: unknown[]): Promise<T> {
    return this.driver.executeScript<T>(script, ...args);
  }

  /**
   * Toma una captura de pantalla
   */
  async takeScreenshot(filename: string): Promise<void> {
    const screenshot = await this.driver.takeScreenshot();
    const fs = await import('fs').then(m => m.promises);
    await fs.writeFile(`tests/screenshots/${filename}.png`, screenshot, 'base64');
  }

  /**
   * Espera a que un elemento tenga un texto específico
   */
  async waitForText(selector: string, text: string, timeout?: number): Promise<void> {
    const duration = timeout || 10000;
    const element = await this.waitForElement(selector, duration);
    await this.driver.wait(
      until.elementTextIs(element, text),
      duration,
      `Texto no coincide. Se espera: "${text}"`
    );
  }

  /**
   * Limpia un campo de input
   */
  async clearField(selector: string): Promise<void> {
    const element = await this.findElement(selector);
    await element.clear();
  }

  /**
   * Selecciona una opción en un select
   */
  async selectOption(selector: string, value: string): Promise<void> {
    const select = await this.findElement(selector);
    const option = await select.findElement(By.css(`option[value="${value}"]`));
    await option.click();
  }

  /**
   * Agrega una cookie al navegador actual
   */
  async addCookie(name: string, value: string): Promise<void> {
    await this.driver.manage().addCookie({ name, value });
  }

  /**
   * Pausa la ejecución (útil para debugging)
   */
  async pause(milliseconds: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}

export default BrowserHelper;

import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as edge from 'selenium-webdriver/edge';

export interface TestConfig {
  baseUrl: string;
  browser: 'chrome' | 'edge';
  headless: boolean;
  timeout: number;
  implicitWait: number;
}

const config: TestConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  browser: process.env.BROWSER === 'chrome' ? 'chrome' : 'edge',
  headless: process.env.HEADLESS === 'true' || false,
  timeout: 10000,
  implicitWait: 5000,
};

let driver: WebDriver | null = null;

export const initDriver = async (): Promise<WebDriver> => {
  const browserOptions = config.browser === 'chrome'
    ? new chrome.Options()
    : new edge.Options();

  if (config.headless) {
    browserOptions.addArguments('--headless=new');
  }

  browserOptions.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,720',
  );

  try {
    const builder = new Builder().forBrowser(
      config.browser === 'chrome' ? 'chrome' : 'MicrosoftEdge',
    );
    driver = config.browser === 'chrome'
      ? await builder.setChromeOptions(browserOptions as chrome.Options).build()
      : await builder.setEdgeOptions(browserOptions as edge.Options).build();
  } catch (error) {
    throw new Error(
      `No se pudo iniciar ${config.browser}. Instala el navegador y su driver, `
      + `o usa BROWSER=chrome|edge. Causa: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  
  // Configurar tiempos de espera
  await driver.manage().setTimeouts({
    implicit: config.implicitWait,
    pageLoad: config.timeout,
  });
  
  return driver;
};

export const getDriver = (): WebDriver => {
  if (!driver) {
    throw new Error('Driver no inicializado. Llamar primero a initDriver()');
  }
  return driver;
};

export const quitDriver = async (): Promise<void> => {
  if (driver) {
    await driver.quit();
    driver = null;
  }
};

export const navigateTo = async (path: string): Promise<void> => {
  const driver = getDriver();
  const url = `${config.baseUrl}${path}`;
  await driver.get(url);
};

export default config;

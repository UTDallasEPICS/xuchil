import { Builder, WebDriver } from 'selenium-webdriver';
import * as edge from 'selenium-webdriver/edge';

export interface TestConfig {
  baseUrl: string;
  headless: boolean;
  timeout: number;
  implicitWait: number;
}

const config: TestConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  headless: process.env.HEADLESS === 'true' || false,
  timeout: 10000,
  implicitWait: 5000,
};

let driver: WebDriver | null = null;

export const initDriver = async (): Promise<WebDriver> => {
  const options = new edge.Options();
  
  // Configuración del navegador Edge
  if (config.headless) {
    options.addArguments('--headless');
  }
  
  // Agregar más opciones si es necesario
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  driver = await new Builder()
    .forBrowser('MicrosoftEdge')
    .setEdgeOptions(options)
    .build();
  
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

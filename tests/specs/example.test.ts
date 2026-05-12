/**
 * Ejemplo simple de una prueba con Selenium
 * Este archivo muestra el flujo básico de una prueba automatizada
 * 
 * Para ejecutar:
 * pnpm test:selenium
 */

import { initDriver, quitDriver, navigateTo } from '../config';
import BrowserHelper from '../helpers/browser';
import { Selectors } from '../helpers/selectors';
import { loginAsAdmin } from '../helpers/session';

describe('Ejemplo Simple', () => {
  let browser: BrowserHelper;

  // Se ejecuta antes de todas las pruebas del describe
  before(async function () {
    this.timeout(20000);
    console.log('🚀 Inicializando el navegador Edge...');
    await initDriver();
    browser = new BrowserHelper();
    console.log('✅ Navegador inicializado');
  });

  // Se ejecuta después de todas las pruebas del describe
  after(async function () {
    this.timeout(10000);
    console.log('🛑 Cerrando navegador...');
    await quitDriver();
    console.log('✅ Navegador cerrado');
  });

  it('Ejemplo 1: Navegar y verificar página', async function () {
    this.timeout(15000);
    
    console.log('📍 Navegando a /login...');
    await navigateTo('/login');
    
    // Esperar a que el título de la página sea correcto
    const title = await browser.getPageTitle();
    console.log(`📄 Título de página: ${title}`);
    
    // Verificar que el formulario existe
    await browser.waitForElementVisible(Selectors.login.emailInput);
    console.log('✅ Formulario de login visible');
  });

  it('Ejemplo 2: Llenar un formulario', async function () {
    this.timeout(15000);
    
    console.log('📝 Llenando formulario de login...');
    
    // Navegar a login
    await navigateTo('/login');
    
    // Esperar a que cargue el formulario
    await browser.waitForElementVisible(Selectors.login.emailInput);
    
    // Llenar campos
    console.log('✍️  Escribiendo email...');
    await browser.typeText(Selectors.login.emailInput, 'admin@xuchil.com');
    
    console.log('✍️  Escribiendo contraseña...');
    await browser.typeText(Selectors.login.passwordInput, 'micontraseña123');
    
    // Verificar que los valores se escribieron
    const email = await browser.getAttribute(Selectors.login.emailInput, 'value');
    console.log(`📧 Email ingresado: ${email}`);
    
    console.log('✅ Formulario llenado correctamente');
  });

  it('Ejemplo 3: Hacer clic y esperar cambios', async function () {
    this.timeout(15000);
    
    console.log('🔐 Iniciando sesión...');
    
    // Navegar a login
    await navigateTo('/login');
    
    // Esperar y llenar formulario
    await browser.waitForElementVisible(Selectors.login.emailInput);
    await browser.typeText(Selectors.login.emailInput, 'admin@xuchil.com');
    await browser.typeText(Selectors.login.passwordInput, 'Admin123');
    
    // Hacer clic en el botón de submit
    console.log('🖱️  Haciendo clic en el botón de login...');
    await browser.click(Selectors.login.submitButton);
    
    // Esperar a que se complete el login
    console.log('⏳ Esperando redirección...');
    await browser.pause(2000);
    
    const url = await browser.getCurrentUrl();
    console.log(`📍 URL actual: ${url}`);
    console.log('✅ Login completado');
  });

  it('Ejemplo 4: Verificar múltiples elementos', async function () {
    this.timeout(15000);
    
    console.log('📊 Verificando tabla de datos...');
    
    await loginAsAdmin(browser);
    
    await browser.waitForElementVisible(Selectors.page.heading, 10000);
    console.log('✅ Perfil cargado');
    
    const rows = await browser.findElements(Selectors.page.inputs);
    console.log(`📌 Encontrados ${rows.length} inputs visibles`);
    
    // Verificar cada fila
    for (let i = 0; i < Math.min(rows.length, 3); i++) {
      const row = rows[i];
      const text = await row.getText();
      console.log(`  Fila ${i + 1}: ${text.substring(0, 50)}...`);
    }
    
    console.log('✅ Verificación completada');
  });

  it('Ejemplo 5: Tomar captura de pantalla', async function () {
    this.timeout(15000);
    
    console.log('📸 Tomando captura de pantalla...');
    
    // Navegar a una página
    await navigateTo('/');
    
    // Esperar a que cargue
    await browser.pause(1000);
    
    // Tomar captura
    // await browser.takeScreenshot('ejemplo-homepage');
    console.log('✅ Captura tomada (descomenta para guardar)');
  });
});

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. ACTUALIZAR SELECTORES:
 *    Los selectores en Selectors.ts son ejemplos.
 *    Debes actualizar los valores reales de tu aplicación.
 * 
 * 2. CREDENCIALES:
 *    Usa credenciales de prueba que existan en tu base de datos.
 *    Para crear usuarios de prueba: pnpm user:create
 * 
 * 3. REQUISITOS:
 *    - La aplicación debe estar corriendo: pnpm dev
 *    - La base de datos debe estar inicializada: pnpm system:reset:full
 *    - Edge debe estar instalado
 * 
 * 4. TIEMPOS DE ESPERA:
 *    Aumenta this.timeout() si las pruebas fallan por timeout.
 *    Aumenta await browser.pause(ms) si faltan datos al cargar.
 * 
 * 5. DEBUGGING:
 *    Usa console.log() para ver el progreso de las pruebas.
 *    Usa await browser.pause(5000) para pausar y verificar manualmente.
 * 
 * 6. PRÓXIMOS PASOS:
 *    - Crea pruebas en tests/specs/ siguiendo este patrón
 *    - Actualiza los selectores según tu UI real
 *    - Ejecuta las pruebas: pnpm test:selenium
 */

# Pruebas Automatizadas con Selenium

Este directorio contiene todas las pruebas automatizadas de la aplicación Xuchil usando Selenium WebDriver con Edge.

## 📋 Estructura de carpetas

```
tests/
├── config.ts              # Configuración de Selenium y el navegador
├── helpers/
│   ├── browser.ts         # Clase con métodos auxiliares para interactuar con el navegador
│   └── selectors.ts       # Selectores de elementos de la UI
├── specs/
│   ├── auth.test.ts       # Pruebas de autenticación y login
│   ├── users.test.ts      # Pruebas de gestión de usuarios
│   └── orders.test.ts     # Pruebas de gestión de órdenes
└── runner.ts              # Script para ejecutar las pruebas
```

## 🚀 Instalación y Configuración

Las dependencias ya están instaladas. Si necesitas instalarlas nuevamente:

```bash
pnpm add -D selenium-webdriver @types/selenium-webdriver mocha @types/mocha
```

## ⚙️ Configuración

### Variables de entorno

Puedes configurar el comportamiento de las pruebas con variables de entorno:

```bash
# URL base de la aplicación (por defecto: http://localhost:3000)
BASE_URL=http://localhost:3000

# Ejecutar en modo headless (por defecto: false)
HEADLESS=false
```

### Selectores

Los selectores de elementos se encuentran en `tests/helpers/selectors.ts`. **Debes actualizar estos selectores según los elementos reales de tu aplicación.**

Ejemplo de cómo actualizar selectores:

```typescript
// selectors.ts
export const Selectors = {
  login: {
    emailInput: 'input[type="email"]',  // Actualizar este selector
    passwordInput: 'input[type="password"]',
    // ...
  },
};
```

## 📝 Scripts disponibles

Agrega estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "test:selenium": "mocha --require ts-node/register tests/specs/**/*.test.ts",
    "test:selenium:headless": "HEADLESS=true pnpm test:selenium",
    "test:selenium:watch": "mocha --watch --require ts-node/register tests/specs/**/*.test.ts"
  }
}
```

## 🏃 Ejecutar las pruebas

### Ejecutar todas las pruebas

```bash
pnpm test:selenium
```

### Ejecutar en modo headless (sin interfaz visible)

```bash
pnpm test:selenium:headless
```

### Ejecutar un archivo de pruebas específico

```bash
mocha --require ts-node/register tests/specs/auth.test.ts
```

### Ejecutar con modo watch (se ejecutan al guardar)

```bash
pnpm test:selenium:watch
```

## ✍️ Escribir nuevas pruebas

### Estructura básica de una prueba

```typescript
import { initDriver, quitDriver, navigateTo } from '../config';
import BrowserHelper from '../helpers/browser';
import { Selectors } from '../helpers/selectors';

describe('Mi Módulo', () => {
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

  it('Debería hacer algo', async function () {
    this.timeout(15000);
    
    // Aquí va tu código de prueba
    await navigateTo('/mi-pagina');
    await browser.waitForElementVisible(Selectors.miSelector);
    // ... más acciones
  });
});
```

### Métodos disponibles en BrowserHelper

```typescript
// Esperar y buscar elementos
await browser.waitForElement(selector);
await browser.findElement(selector);
await browser.findElements(selector);

// Interactuar con elementos
await browser.click(selector);
await browser.typeText(selector, 'texto');
await browser.clearField(selector);

// Obtener información
await browser.getText(selector);
await browser.getAttribute(selector, 'attr');
await browser.getPageTitle();
await browser.getCurrentUrl();

// Esperas condicionales
await browser.waitForElementVisible(selector);
await browser.waitForElementNotPresent(selector);
await browser.waitForText(selector, 'texto');

// Utilidades
await browser.selectOption(selector, 'value');
await browser.pause(milliseconds);
await browser.takeScreenshot('nombre');
```

## 🔍 Debugging

### Tomar capturas de pantalla

```typescript
await browser.takeScreenshot('mi-captura');
```

Las capturas se guardan en `tests/screenshots/`.

### Pausar la ejecución

```typescript
await browser.pause(2000); // Pausa de 2 segundos
```

### Ejecutar JavaScript en el navegador

```typescript
const resultado = await browser.executeScript<string>('return document.title');
```

## ⚠️ Cosas importantes

1. **Actualizar selectores**: Los selectores en `selectors.ts` son ejemplos. **Debes actualizarlos según tu UI real.**

2. **Credenciales de prueba**: En las pruebas se usan credenciales de ejemplo. Asegúrate de tener usuarios de prueba en tu base de datos.

3. **Tiempos de espera**: Los tiempos están configurados por defecto a 10 segundos. Ajústalos según sea necesario.

4. **Base de datos**: Asegúrate de que la aplicación esté ejecutándose y la base de datos esté poblada antes de ejecutar las pruebas.

## 🛠️ Requisitos previos

1. **Base de datos configurada y accesible**
   ```bash
   pnpm prisma db push
   pnpm prisma:seed:users-clean
   ```

2. **Aplicación ejecutándose**
   ```bash
   pnpm dev
   ```

3. **Edge instalado** (las pruebas usan Edge WebDriver)

## 📦 Flujo típico de pruebas

1. Inicializar el driver con `initDriver()`
2. Navegar a una URL con `navigateTo()`
3. Esperar a que aparezcan elementos con `waitForElement*`
4. Interactuar con elementos: `click`, `typeText`, etc.
5. Hacer aserciones sobre el estado de la aplicación
6. Finalizar con `quitDriver()`

## 🤝 Contribuciones

Al agregar nuevas pruebas:

1. Sigue la estructura existente
2. Documenta los selectores usados
3. Usa nombres descriptivos para las pruebas
4. Configura timeouts apropiados para cada caso
5. Maneja los errores de forma clara

## 📚 Recursos

- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/webdriver/)
- [Mocha Testing Framework](https://mochajs.org/)
- [Edge WebDriver](https://learn.microsoft.com/en-us/microsoft-edge/webdriver-chromium/)

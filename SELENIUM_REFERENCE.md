# 📋 Referencia Rápida de Comandos

## 🚀 Comenzar

```bash
# 1. Instalar dependencias (ya hecho)
pnpm install

# 2. Resetear base de datos con datos de prueba
pnpm system:reset:full

# 3. Iniciar la aplicación
pnpm dev

# 4. En otra terminal: Ejecutar pruebas
pnpm test:selenium
```

## 🧪 Comandos de Pruebas

```bash
# Ejecutar TODAS las pruebas
pnpm test:selenium

# Ejecutar solo el ejemplo simple (RECOMENDADO PARA EMPEZAR)
pnpm test:selenium tests/specs/example.test.ts

# Ejecutar un archivo específico
pnpm test:selenium tests/specs/auth.test.ts
pnpm test:selenium tests/specs/users.test.ts
pnpm test:selenium tests/specs/orders.test.ts

# Modo headless (sin ventana del navegador)
pnpm test:selenium:headless

# Modo watch (ejecuta automáticamente al guardar)
pnpm test:selenium:watch
```

## 📁 Estructura de Archivos

```
tests/
├── config.ts                    # Configuración de Selenium
├── runner.ts                    # Script de ejecución
├── README.md                    # Documentación completa
├── helpers/
│   ├── browser.ts               # Métodos para controlar el navegador
│   ├── selectors.ts             # Selectores CSS de elementos
│   └── test-utils.ts            # Utilidades avanzadas
└── specs/
    ├── example.test.ts          # ⭐ EMPIEZA AQUÍ
    ├── auth.test.ts             # Pruebas de login/logout
    ├── users.test.ts            # Pruebas de gestión de usuarios
    └── orders.test.ts           # Pruebas de órdenes
```

## ⚙️ Configuración Importante

### Cambiar URL de prueba
En `tests/config.ts`:
```typescript
const config: TestConfig = {
  baseUrl: 'http://localhost:3000',  // ← Cambiar aquí
};
```

### Cambiar navegador
En `tests/config.ts` - cambiar de Edge a Firefox o Chrome (requiere instalar webdriver adicional)

### Cambiar selectores de elementos
En `tests/helpers/selectors.ts`:
```typescript
export const Selectors = {
  login: {
    emailInput: 'input[name="email"]',    // ← Actualizar estos
    passwordInput: 'input[name="password"]',
  },
  // ...
};
```

## 🔧 Métodos Principales de BrowserHelper

```typescript
// Navegación
await browser.waitForElement(selector)
await browser.findElement(selector)
await browser.findElements(selector)

// Acciones
await browser.click(selector)
await browser.typeText(selector, 'texto')
await browser.clearField(selector)
await browser.selectOption(selector, 'valor')

// Información
await browser.getText(selector)
await browser.getAttribute(selector, 'attr')
await browser.getPageTitle()
await browser.getCurrentUrl()

// Esperas
await browser.waitForElementVisible(selector)
await browser.waitForElementNotPresent(selector)
await browser.waitForText(selector, 'texto')
await browser.pause(2000)

// Utilidades
await browser.takeScreenshot('nombre')
await browser.executeScript('return document.title')
```

## 🛠️ Métodos Principales de TestUtils

```typescript
// Autenticación
await utils.login(email, password)
await utils.logout()
await utils.loginAndWaitForDashboard(email, password)

// Usuarios
await utils.createUser(name, email, role)
await utils.fillUserForm({ name, email, role })

// Productos/Inventario
await utils.addProduct(name, quantity, unit)

// Datos
await utils.getTableRowCount()
await utils.clearTableRows()

// Validaciones
await utils.assertElementContainsText(selector, text)
await utils.assertPageContains(text)
await utils.assertFieldValue(selector, expectedValue)

// Esperas
await utils.waitForSuccessMessage()
await utils.waitForErrorMessage()
await utils.waitForUrlChange(previousUrl)
await utils.waitForElementClickable(selector)

// Utilidades
await utils.closeModalsIfOpen()
await utils.takeTimestampedScreenshot('testName')
```

## 📊 Plantilla Básica de Prueba

```typescript
import { initDriver, quitDriver, navigateTo } from '../config';
import BrowserHelper from '../helpers/browser';
import TestUtils from '../helpers/test-utils';
import { Selectors } from '../helpers/selectors';

describe('Nombre de mi suite de pruebas', () => {
  let browser: BrowserHelper;
  let utils: TestUtils;

  before(async function () {
    this.timeout(20000);
    await initDriver();
    browser = new BrowserHelper();
    utils = new TestUtils(browser);
  });

  after(async function () {
    this.timeout(10000);
    await quitDriver();
  });

  it('Debería hacer algo específico', async function () {
    this.timeout(15000);
    
    // Arrange (preparar)
    await navigateTo('/login');
    
    // Act (actuar)
    await utils.login('usuario@test.com', 'password');
    
    // Assert (verificar)
    await utils.assertPageContains('Dashboard');
  });
});
```

## ✅ Checklist Antes de Ejecutar Pruebas

- [ ] Actualizar selectores en `selectors.ts`
- [ ] Tener usuarios de prueba en la base de datos
- [ ] Aplicación corriendo en `http://localhost:3000`
- [ ] Edge instalado
- [ ] Dependencias instaladas: `pnpm install`

## 🐛 Debugging

### Ver logs de la prueba
Agregar `console.log()` en cualquier parte:
```typescript
console.log('🚀 Iniciando prueba');
console.log('📍 URL:', await browser.getCurrentUrl());
```

### Pausar y inspeccionar manualmente
```typescript
await browser.pause(5000);  // Pausa 5 segundos para inspeccionar
```

### Tomar captura de pantalla
```typescript
await browser.takeScreenshot('debug-screenshot');
```

### Ejecutar JavaScript en el navegador
```typescript
const resultado = await browser.executeScript<string>('return document.title');
console.log('Título:', resultado);
```

## 🚨 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Timeout esperando elemento` | Selector incorrecto | Actualizar en `selectors.ts` |
| `Edge no se abre` | Edge no instalado | Descargar desde microsoft.com |
| `Conexión rechazada` | Aplicación no está corriendo | Ejecutar `pnpm dev` |
| `Base de datos vacía` | No hay datos de prueba | Ejecutar `pnpm system:reset:full` |
| `Prueba muy lenta` | Demasiadas pausas | Reducir `await browser.pause()` |

---

**¿Listo para empezar?** 

1. Lee `SELENIUM_QUICKSTART.md` para guía paso a paso
2. Ejecuta `pnpm test:selenium tests/specs/example.test.ts`
3. Abre `tests/README.md` para documentación completa

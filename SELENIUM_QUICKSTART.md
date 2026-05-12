# 🚀 Guía Rápida - Pruebas Automatizadas con Selenium

## 1. Preparación Inicial (⏱️ 5 minutos)

### Paso 1: Asegurar que está todo instalado
```bash
cd c:\Users\Marle\OneDrive\Documentos\GitHub\xuchil
pnpm install
```

### Paso 2: Inicializar la base de datos
```bash
# Resetear base de datos y poblarla con datos de prueba
pnpm system:reset:full
```

### Paso 3: Iniciar la aplicación
En una terminal PowerShell:
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 2. Ejecutar las Pruebas (⏱️ 1 minuto)

En otra terminal PowerShell:

### Opción A: Ejecutar el ejemplo simple (RECOMENDADO PARA EMPEZAR)
```bash
pnpm test:selenium tests/specs/example.test.ts
```

### Opción B: Ejecutar todas las pruebas
```bash
pnpm test:selenium
```

### Opción C: Ejecutar en modo headless (sin interfaz)
```bash
pnpm test:selenium:headless
```

### Opción D: Modo watch (ejecuta automáticamente al guardar archivos)
```bash
pnpm test:selenium:watch
```

## 3. ⚙️ IMPORTANTE: Actualizar Selectores

Antes de ejecutar pruebas reales, **DEBES actualizar los selectores** de elementos en:

📁 `tests/helpers/selectors.ts`

Pasos para actualizar un selector:

### 1️⃣ Abrir DevTools de Edge
- Presiona `F12` en tu navegador
- O haz clic derecho → "Inspeccionar"

### 2️⃣ Encontrar el elemento
- En DevTools, haz clic en el icono "Select Element" (esquina superior izquierda)
- Haz clic en el elemento en la página que quieres probar

### 3️⃣ Copiar el selector CSS
- Haz clic derecho en el elemento en DevTools
- Selecciona "Copy" → "Copy selector"

### 4️⃣ Actualizar en selectors.ts
```typescript
// Antes (INCORRECTO):
emailInput: 'input[type="email"]',

// Después (CORRECTO - tu selector real):
emailInput: '#email',  // o el selector que copiaste
```

## 4. 📝 Escribir tu Primera Prueba

### Crear nuevo archivo
Copia el contenido de `tests/specs/example.test.ts` a `tests/specs/mi-prueba.test.ts`

### Ejemplo mínimo:
```typescript
import { initDriver, quitDriver, navigateTo } from '../config';
import BrowserHelper from '../helpers/browser';
import { Selectors } from '../helpers/selectors';

describe('Mi Primera Prueba', () => {
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

  it('Debería hacer login', async function () {
    this.timeout(15000);
    
    // 1. Navegar a la página
    await navigateTo('/login');
    
    // 2. Esperar a que aparezca el campo de email
    await browser.waitForElementVisible(Selectors.login.emailInput);
    
    // 3. Escribir en los campos
    await browser.typeText(Selectors.login.emailInput, 'usuario@test.com');
    await browser.typeText(Selectors.login.passwordInput, 'password123');
    
    // 4. Hacer clic en el botón
    await browser.click(Selectors.login.submitButton);
    
    // 5. Esperar a que se complete
    await browser.pause(2000);
    
    // 6. Verificar que funcionó (verifica la URL o un elemento)
    const url = await browser.getCurrentUrl();
    if (!url.includes('dashboard')) {
      throw new Error('No se completó el login');
    }
  });
});
```

### Ejecutar tu prueba:
```bash
pnpm test:selenium
```

## 5. 🔍 Métodos Útiles para Pruebas

```typescript
// Navegación
await navigateTo('/ruta');
await browser.getCurrentUrl();

// Buscar elementos
await browser.findElement(selector);
await browser.waitForElementVisible(selector);
await browser.findElements(selector);  // múltiples

// Interactuar
await browser.click(selector);
await browser.typeText(selector, 'texto');
await browser.clearField(selector);
await browser.selectOption(selector, 'valor');

// Información
await browser.getText(selector);
await browser.getAttribute(selector, 'class');
await browser.getPageTitle();

// Esperas
await browser.pause(2000);  // 2 segundos
await browser.waitForText(selector, 'Texto esperado');
await browser.waitForElementNotPresent(selector);

// Debug
await browser.takeScreenshot('nombre');
await browser.executeScript('return document.title');
```

## 6. ❌ Solucionar Problemas

### La prueba dice "Elemento no encontrado"
```
❌ Timeout esperando elemento: input[type="email"]
```

**Solución:**
1. Verifica que el selector es correcto (actualizar en `selectors.ts`)
2. Aumenta el timeout: `await browser.waitForElement(selector, 20000)`
3. Verifica que la página se cargó: `await browser.pause(2000)`

### La prueba es muy lenta
- Reduce los `await browser.pause()` a lo mínimo necesario
- Verifica que `implicit wait` en `config.ts` no es muy alto

### Edge no se abre
- Verifica que Edge está instalado: `microsoft-edge://version/`
- Reinicia la terminal PowerShell
- Verifica que el puerto 3000 está disponible

### Base de datos vacía
```bash
pnpm system:reset:full
```

## 7. 📊 Próximos Pasos

1. ✅ Actualizar todos los selectores en `selectors.ts`
2. ✅ Ejecutar el archivo `example.test.ts` para verificar que todo funciona
3. ✅ Escribir pruebas para tus casos de uso principales
4. ✅ Integrar en CI/CD si es necesario
5. ✅ Ejecutar periódicamente: `pnpm test:selenium`

## 8. 📚 Recursos

- [Documentación Selenium](https://www.selenium.dev/documentation/webdriver/)
- [Guía Mocha Testing](https://mochajs.org/)
- [DevTools Edge](https://learn.microsoft.com/en-us/microsoft-edge/devtools-guide-chromium/)

---

**¿Necesitas ayuda?** Revisa el archivo completo `tests/README.md` para más detalles.

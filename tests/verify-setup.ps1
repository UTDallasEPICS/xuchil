#!/usr/bin/env pwsh
# Verificar que todo está configurado correctamente para Selenium
# Ejecutar: .\tests\verify-setup.ps1

Write-Host "`n✅ VERIFICANDO CONFIGURACIÓN DE SELENIUM`n" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# 1. Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
try {
  $nodeVersion = node --version
  Write-Host "   ✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
  $errors += "Node.js no está instalado o no está en PATH"
}

# 2. Verificar pnpm
Write-Host "📦 Verificando pnpm..." -ForegroundColor Yellow
try {
  $pnpmVersion = pnpm --version
  Write-Host "   ✓ pnpm $pnpmVersion" -ForegroundColor Green
} catch {
  $errors += "pnpm no está instalado"
}

# 3. Verificar Edge
Write-Host "🌐 Verificando Microsoft Edge..." -ForegroundColor Yellow
$edgePaths = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

$edgeFound = $false
foreach ($path in $edgePaths) {
  if (Test-Path $path) {
    Write-Host "   ✓ Edge encontrado" -ForegroundColor Green
    $edgeFound = $true
    break
  }
}

if (-not $edgeFound) {
  $warnings += "Edge no encontrado - necesario para ejecutar las pruebas"
}

# 4. Verificar estructura de carpetas
Write-Host "`n📁 Verificando estructura de carpetas..." -ForegroundColor Yellow

$folders = @(
  "tests",
  "tests\helpers",
  "tests\specs"
)

foreach ($folder in $folders) {
  if (Test-Path $folder) {
    Write-Host "   ✓ $folder" -ForegroundColor Green
  } else {
    $errors += "Falta la carpeta: $folder"
  }
}

# 5. Verificar archivos clave
Write-Host "`n📄 Verificando archivos clave..." -ForegroundColor Yellow

$files = @(
  "tests\config.ts",
  "tests\helpers\browser.ts",
  "tests\helpers\selectors.ts",
  "tests\helpers\test-utils.ts",
  "tests\specs\example.test.ts",
  "tests\README.md",
  "package.json",
  ".mocharc.json"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "   ✓ $file" -ForegroundColor Green
  } else {
    $errors += "Falta el archivo: $file"
  }
}

# 6. Verificar dependencias en package.json
Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Yellow

$dependencies = @(
  "selenium-webdriver",
  "mocha",
  "chai",
  "typescript",
  "ts-node"
)

if (Test-Path "node_modules") {
  foreach ($dep in $dependencies) {
    if (Test-Path "node_modules\$dep") {
      Write-Host "   ✓ $dep" -ForegroundColor Green
    } else {
      $warnings += "Dependencia no instalada: $dep (ejecuta: pnpm install)"
    }
  }
} else {
  $errors += "node_modules no encontrado (ejecuta: pnpm install)"
}

# 7. Verificar scripts en package.json
Write-Host "`n🔧 Verificando scripts en package.json..." -ForegroundColor Yellow

$packageJson = Get-Content package.json | ConvertFrom-Json

if ($packageJson.scripts."test:selenium") {
  Write-Host "   ✓ test:selenium" -ForegroundColor Green
} else {
  $warnings += "Script 'test:selenium' no encontrado en package.json"
}

# 8. Verificar base de datos
Write-Host "`n💾 Verificando configuración de base de datos..." -ForegroundColor Yellow

if (Test-Path "prisma\schema.prisma") {
  Write-Host "   ✓ Prisma schema encontrado" -ForegroundColor Green
} else {
  $errors += "Prisma schema no encontrado"
}

# Resultados
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan

if ($errors.Count -eq 0) {
  Write-Host "✅ CONFIGURACIÓN COMPLETADA CORRECTAMENTE`n" -ForegroundColor Green
} else {
  Write-Host "❌ ENCONTRADOS $($errors.Count) ERRORES`n" -ForegroundColor Red
  foreach ($error in $errors) {
    Write-Host "   ✗ $error" -ForegroundColor Red
  }
}

if ($warnings.Count -gt 0) {
  Write-Host "⚠️  ADVERTENCIAS ($($warnings.Count))`n" -ForegroundColor Yellow
  foreach ($warning in $warnings) {
    Write-Host "   ⚠ $warning" -ForegroundColor Yellow
  }
}

# Pasos siguientes
Write-Host "`n📋 PRÓXIMOS PASOS:`n" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
  Write-Host "1. Asegurate de tener los datos de prueba:" -ForegroundColor White
  Write-Host "   pnpm system:reset:full`n" -ForegroundColor Gray
  
  Write-Host "2. Inicia la aplicación en una terminal:" -ForegroundColor White
  Write-Host "   pnpm dev`n" -ForegroundColor Gray
  
  Write-Host "3. En otra terminal, ejecuta las pruebas:" -ForegroundColor White
  Write-Host "   pnpm test:selenium`n" -ForegroundColor Gray
  
  Write-Host "4. O empieza con el ejemplo simple:" -ForegroundColor White
  Write-Host "   pnpm test:selenium tests/specs/example.test.ts`n" -ForegroundColor Gray
} else {
  Write-Host "Soluciona los errores anteriores antes de continuar`n" -ForegroundColor Red
}

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "`n📚 Documentación:" -ForegroundColor Cyan
Write-Host "   - SELENIUM_QUICKSTART.md (guía paso a paso)"
Write-Host "   - SELENIUM_REFERENCE.md (referencia rápida)"
Write-Host "   - tests/README.md (documentación completa)`n"

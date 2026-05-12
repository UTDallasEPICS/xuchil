// Script para ejecutar las pruebas con Selenium
// Instalar dependencias: pnpm add -D mocha chai @types/mocha
// Ejecutar: pnpm test:selenium

import { spawn } from 'child_process';
import * as path from 'path';

const runTests = async () => {
  const mocha = spawn('mocha', ['--require', 'ts-node/register', 'tests/specs/**/*.test.ts'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  });

  mocha.on('exit', (code) => {
    process.exit(code || 0);
  });

  mocha.on('error', (err) => {
    console.error('Error al ejecutar las pruebas:', err);
    process.exit(1);
  });
};

runTests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

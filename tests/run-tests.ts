#!/usr/bin/env node

/**
 * Script para ejecutar pruebas con Mocha y TypeScript
 * Uso: npx tsx tests/run-tests.ts [args]
 */

import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(dirname(__dirname));

// Obtener argumentos
const args = process.argv.slice(2);

// Ejecutar mocha con ts-node/register
const result = spawnSync('mocha', [
  '--require',
  'ts-node/register',
  'tests/specs/**/*.test.ts',
  ...args
], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    TS_NODE_TRANSPILE_ONLY: 'true',
    NODE_OPTIONS: '--loader ts-node/esm'
  }
});

process.exit(result.status || 0);

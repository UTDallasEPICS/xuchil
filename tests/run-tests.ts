#!/usr/bin/env node

/**
 * Script para ejecutar pruebas con Mocha y TypeScript
 * Uso: npx tsx tests/run-tests.ts [args]
 */

import { spawnSync } from 'child_process';
import { resolve } from 'path';

const projectRoot = process.cwd();

const args = process.argv.slice(2);
const specs = args.length > 0 ? args : ['tests/specs/**/*.test.ts'];

const result = spawnSync(process.execPath, [
  '--import',
  'tsx',
  resolve(projectRoot, 'node_modules/mocha/bin/_mocha'),
  '--no-config',
  ...specs,
], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
  }
});

process.exit(result.status || 0);

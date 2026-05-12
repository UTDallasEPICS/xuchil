// Configuración de Mocha para ejecutar pruebas TypeScript con ts-node

require('ts-node').register({
  project: 'tsconfig.test.json',
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

module.exports = {
  extensions: ['ts'],
  spec: 'tests/specs/**/*.test.ts',
  timeout: 30000,
  reporter: 'spec',
  exit: true
};


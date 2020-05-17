import * as fs from 'fs';
import * as path from 'path';

const packagesRoot = path.join(__dirname, '..', 'packages');

const packages = fs.readdirSync(packagesRoot).filter(item => fs.lstatSync(path.join(packagesRoot, item)).isDirectory());

packages.forEach(packageName => {
  const jestConfigPath = path.join(packagesRoot, packageName, 'jest.config.js');

  let jestConfigValues = {
    name: packageName,
    displayName: packageName,
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    testPathIgnorePatterns: ['/lib/'],
    setupFilesAfterEnv: ['./lib/test.setup.js'],
    globals: {
      'ts-jest': {
        diagnostics: false,
      },
    },

    // testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  };

  let jestConfigContent = `module.exports = ${JSON.stringify(jestConfigValues, null, '  ')}`;

  fs.writeFileSync(jestConfigPath, jestConfigContent);
});

module.exports = {
  clearMocks: true,
  // globals: {
  //   'ts-jest': {
  //     extends: './babel.config.js',
  //   },
  // },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  modulePathIgnorePatterns: ['lib'],
  moduleNameMapper: {
    '@taxi/(.+)$': '<rootDir>packages/$1/src',
  },
  notify: true,
  notifyMode: 'always',
  rootDir: './',
  roots: ['<rootDir>packages'],
  testMatch: ['**/__tests__/*.+(ts|tsx|js)', '**/*.test.+(ts|tsx|js)'],
  // transform: {
  //   '^.+\\.(ts|tsx)$': 'ts-jest',
  // },
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  // setupFilesAfterEnv: ['<rootDir>jest/setupTests.ts'],
};

// module.exports = {
//   // preset: 'ts-jest',
//   projects: ['<rootDir>/packages/di', '<rootDir>/packages/react-di', '<rootDir>/packages/redux-di'],
//   // testPathIgnorePatterns: ['tsconfig\\.json', '^.+\\.json'],
//   // moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
//   // testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
//   // globals: {
//     // 'ts-jest': {
//     //   tsConfig: './packages/tsconfig.json',
//     // },
//   // },
// };

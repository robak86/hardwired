module.exports = {
  clearMocks: true,
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
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};

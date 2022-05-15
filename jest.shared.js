export default {
  clearMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  modulePathIgnorePatterns: ['lib'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['<rootDir>/src/**/*.test.+(ts|tsx|js)'],
  coveragePathIgnorePatterns: ['__test__'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      diagnostics: false,
      useESM: true,
    },
  }
};

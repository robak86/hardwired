export default {
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  modulePathIgnorePatterns: ['lib'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(svg|png|jpg)$': 'imitation/images',
    '\\.(scss|css)$': 'imitation/styles',
  },
  transform: {},
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testMatch: ['<rootDir>/src/**/*.test.+(ts|tsx|js)'],
  coveragePathIgnorePatterns: ['__test__'],
  preset: 'ts-jest/presets/default-esm',
  globals: {
    'ts-jest': {
      diagnostics: false,
      useESM: true,
    },
  },
};

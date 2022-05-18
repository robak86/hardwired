import defaults from '../../jest.shared.js';

export default {
  ...defaults,
  displayName: 'react',
  moduleNameMapper: {
    ...defaults.moduleNameMapper,
    // https://github.com/uuidjs/uuid/pull/616#issuecomment-1114696186
    '^uuid$': '<rootDir>/../../node_modules/uuid/dist/index.js',
  },
  transformIgnorePatterns: ['node_modules/?!(uuid)'],
  testEnvironment: 'jsdom',
};

import defaults from '../../jest.shared.js';


export default {
  ...defaults,
  testEnvironment: 'jsdom',
  displayName: 'example',

  setupFilesAfterEnv: ['<rootDir>jest.setup.js'],
  moduleNameMapper: {
    '\\.(svg|png|jpg)$': 'imitation/images',
    '\\.(scss|css)$': 'imitation/styles',
  },
  collectCoverageFrom: [],
};


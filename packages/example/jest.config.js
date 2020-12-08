const defaults = require('../../jest.shared.js');

module.exports = {
  ...defaults,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>jest.setup.js'],
  "moduleNameMapper": {
    "\\.(svg|png|jpg)$": "imitation/images",
    "\\.(scss|css)$": "imitation/styles"
  }
};

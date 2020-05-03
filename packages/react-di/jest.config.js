module.exports = {
  name: 'react-di',
  displayName: 'react-di',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: './',
  testPathIgnorePatterns: ['/lib/'],
  setupFilesAfterEnv: ['./lib/test.setup.js'],
};

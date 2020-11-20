module.exports = {
  projects: ['<rootDir>/packages/*/jest.config.js'],
  coverageDirectory: '<rootDir>/coverage/',
  collectCoverageFrom: ['<rootDir>/packages/*/src/**/*.{ts,tsx}'],

  // testURL: 'http://localhost/',
  // moduleDirectories: ['node_modules'],
  // snapshotSerializers: ['enzyme-to-json/serializer'],
};

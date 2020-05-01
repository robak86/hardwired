module.exports = {
  "name": "di",
  "displayName": "di",
  "preset": "ts-jest",
  "testEnvironment": "node",
  "rootDir": "./",
  "testPathIgnorePatterns": [
    "/lib/"
  ],
  "setupFilesAfterEnv": [
    "./lib/test.setup.js"
  ]
}
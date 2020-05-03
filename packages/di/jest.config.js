module.exports = {
  "name": "di",
  "displayName": "di",
  "preset": "ts-jest",
  "testEnvironment": "jsdom",
  "rootDir": "./",
  "testPathIgnorePatterns": [
    "/lib/"
  ],
  "setupFilesAfterEnv": [
    "./lib/test.setup.js"
  ]
}
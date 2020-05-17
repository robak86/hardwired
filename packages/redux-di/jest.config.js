module.exports = {
  "name": "redux-di",
  "displayName": "redux-di",
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
module.exports = {
  "name": "react-di",
  "displayName": "react-di",
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
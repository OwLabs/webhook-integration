 
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: [
    "**/src/test/**/*.[jt]s?(x)",
    "**/src/**/?(*.)+(spec|test).[jt]s?(x)",
    "**/src/**/?(*.)+(e2e-spec).[jt]s?(x)",
  ],
  testPathIgnorePatterns: ["dist/"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testMatch: ["**/?(*.)+(spec|test).[t]s?(x)"],
    transformIgnorePatterns: ["<rootDir>/node_modules/"],
  };
  
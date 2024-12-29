module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/_tests_/**/*.+(ts|tsx|js)"],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  }
};

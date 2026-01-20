module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e/tests/api'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    'services/*/src/**/*.ts',
    '!services/*/src/**/*.test.ts',
    '!services/*/src/**/*.spec.ts',
    '!services/*/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testTimeout: 30000,
}

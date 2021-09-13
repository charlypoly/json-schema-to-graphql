module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/lib'],

  automock: false,

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],

  collectCoverageFrom: ['lib/**/*.{ts,tsx}'],
  coverageReporters: ['text', 'lcov'],
  collectCoverage: true,
  coverageThreshold: {
    'src/lib': {
      branches: 70,
    },
  },

  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testMatch: ['<rootDir>/lib/**/*.{spec,test}.{ts,tsx}'],

  modulePaths: [],

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

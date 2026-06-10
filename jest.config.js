module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/scheduler.test.ts'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    },
    {
      displayName: 'rn',
      preset: '@react-native/jest-preset',
      testMatch: ['**/__tests__/App.test.tsx'],
    },
  ],
};
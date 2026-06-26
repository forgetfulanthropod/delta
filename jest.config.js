module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '**/__tests__/scheduler.test.ts',
        '**/__tests__/scopeFromLabor.test.ts',
        '**/__tests__/analyzeRoom.test.ts',
        '**/__tests__/roomAnalysis.test.ts',
        '**/__tests__/projectProgress.test.ts',
      ],
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
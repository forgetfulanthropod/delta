module.exports = {
  presets: ['module:@react-native/babel-preset'],
  overrides: [
    {
      // Web-specific overrides
      test: /\.web\.(js|jsx|ts|tsx)$/,
      presets: ['@babel/preset-react'],
    },
  ],
};
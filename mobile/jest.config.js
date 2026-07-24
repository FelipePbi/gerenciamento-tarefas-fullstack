module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
    '^lucide-react-native$': '<rootDir>/__mocks__/lucide.js',
    '^@react-navigation/native$': '<rootDir>/__mocks__/navigation.js',
    '^@react-navigation/native-stack$': '<rootDir>/__mocks__/nativeStack.js',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/safeArea.js',
    '^react-native-screens$': '<rootDir>/__mocks__/screens.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((@)?react-native|@react-native(-community)?|@react-navigation|nativewind|react-native-css-interop|lucide-react-native|react-native-svg)/)',
  ],
};

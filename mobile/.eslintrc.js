module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // `void promise` makes intentionally fire-and-forget query invalidations explicit.
    'no-void': 'off',
    // Team/status colors come from API/domain data and cannot be static StyleSheet entries.
    'react-native/no-inline-styles': 'off',
  },
};

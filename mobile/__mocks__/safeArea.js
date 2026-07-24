const React = require('react');
const { View } = require('react-native');

module.exports = {
  SafeAreaProvider: ({ children }) =>
    React.createElement(React.Fragment, null, children),
  SafeAreaView: View,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  initialWindowMetrics: null,
};

const React = require('react');

const Screen = () => null;
const Navigator = ({ children }) => {
  const first = React.Children.toArray(children)[0];
  return first ? React.createElement(first.props.component) : null;
};

module.exports = { createNativeStackNavigator: () => ({ Navigator, Screen }) };

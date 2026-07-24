const React = require('react');

let routeParams;
let lastNavigation;

const navigation = {
  navigate: (...args) => {
    lastNavigation = { method: 'navigate', args };
  },
  goBack: (...args) => {
    lastNavigation = { method: 'goBack', args };
  },
  popToTop: (...args) => {
    lastNavigation = { method: 'popToTop', args };
  },
  replace: (...args) => {
    lastNavigation = { method: 'replace', args };
  },
};

module.exports = {
  DarkTheme: {
    dark: true,
    colors: {
      background: '#000',
      card: '#000',
      border: '#000',
      text: '#fff',
      primary: '#0a7',
      notification: '#f00',
    },
  },
  NavigationContainer: ({ children }) =>
    React.createElement(React.Fragment, null, children),
  __getLastNavigation: () => lastNavigation,
  __resetNavigation: () => {
    lastNavigation = undefined;
    routeParams = undefined;
  },
  __setRouteParams: params => {
    routeParams = params;
  },
  useNavigation: () => navigation,
  useRoute: () => ({ params: routeParams }),
};

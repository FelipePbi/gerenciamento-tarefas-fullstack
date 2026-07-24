/* global jest */

jest.mock('react-native-config', () => ({ API_BASE_URL: 'http://test.local' }));

jest.mock('react-native-mmkv', () => {
  const values = new Map();
  return {
    createMMKV: () => ({
      set: (key, value) => values.set(key, value),
      getString: key => values.get(key),
      remove: key => values.delete(key),
      clearAll: () => values.clear(),
    }),
  };
});

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

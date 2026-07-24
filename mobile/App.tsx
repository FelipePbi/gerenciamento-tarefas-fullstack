import './global.css';

import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onlineManager } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from './src/app/queryClient';
import type { RootStackParamList } from './src/navigation/types';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { TaskFormScreen } from './src/screens/TaskFormScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { TeamFormScreen } from './src/screens/TeamFormScreen';
import { TeamsScreen } from './src/screens/TeamsScreen';
import { queryPersister } from './src/storage/queryPersister';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#1D1E22',
    card: '#1D1E22',
    border: '#313238',
  },
};

function App() {
  useEffect(
    () =>
      NetInfo.addEventListener(state =>
        onlineManager.setOnline(Boolean(state.isConnected)),
      ),
    [],
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1D1E22" />
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          buster: 'v2',
          dehydrateOptions: { shouldDehydrateMutation: () => false },
        }}
      >
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Teams" component={TeamsScreen} />
            <Stack.Screen name="TeamForm" component={TeamFormScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="TaskForm" component={TaskFormScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;

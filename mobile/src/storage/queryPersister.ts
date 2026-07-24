import type {
  PersistedClient,
  Persister,
} from '@tanstack/query-persist-client-core';
import { createMMKV } from 'react-native-mmkv';

const CACHE_KEY = 'react-query-cache-v1';
const storage = createMMKV({ id: 'times-tarefas-cache' });

export const queryPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    storage.set(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const value = storage.getString(CACHE_KEY);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as PersistedClient;
    } catch {
      storage.remove(CACHE_KEY);
      return undefined;
    }
  },
  removeClient: async () => {
    storage.remove(CACHE_KEY);
  },
};

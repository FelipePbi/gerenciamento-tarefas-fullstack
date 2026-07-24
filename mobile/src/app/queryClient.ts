import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 7 * 24 * 60 * 60 * 1000,
      retry: 2,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});

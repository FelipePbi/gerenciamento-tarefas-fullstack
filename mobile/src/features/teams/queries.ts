import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '../../services/apiClient';
import type { TeamInput } from '../../types/domain';

export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (search: string, limit: number) =>
    [...teamKeys.lists(), { search, limit }] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

export function useInfiniteTeams(search: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: teamKeys.list(search, limit),
    queryFn: ({ pageParam, signal }) =>
      api.listTeams({ search, limit, offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: last =>
      last.meta.hasNext ? last.meta.offset + last.meta.limit : undefined,
  });
}

export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: teamKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.getTeam(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useSaveTeam(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TeamInput) =>
      id ? api.updateTeam(id, input) : api.createTeam(input),
    onSuccess: team => {
      queryClient.setQueryData(teamKeys.detail(team.id), team);
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTeam,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: teamKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

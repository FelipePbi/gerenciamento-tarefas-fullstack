import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from '../../services/apiClient';
import type {
  Paginated,
  Task,
  TaskInput,
  TaskStatus,
} from '../../types/domain';
import { getNextTaskPageParam, TASK_PAGE_SIZE } from './pagination';

export type TaskFilters = {
  teamId?: string;
  status?: TaskStatus;
  search: string;
  sort: string;
  limit?: number;
};

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

export function useInfiniteTasks(filters: TaskFilters) {
  const normalizedFilters = {
    ...filters,
    limit: filters.limit ?? TASK_PAGE_SIZE,
  };
  return useInfiniteQuery({
    queryKey: taskKeys.list(normalizedFilters),
    queryFn: ({ pageParam, signal }) =>
      api.listTasks({ ...normalizedFilters, offset: pageParam }, signal),
    initialPageParam: 0,
    getNextPageParam: getNextTaskPageParam,
  });
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.getTask(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useSaveTask(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) =>
      id ? api.updateTask(id, input) : api.createTask(input),
    onSuccess: task => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function replaceTaskInPages(
  data: InfiniteData<Paginated<Task>> | undefined,
  task: Task,
): InfiniteData<Paginated<Task>> | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      data: page.data.map(item => (item.id === task.id ? task : item)),
    })),
  };
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.updateTaskStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const detailKey = taskKeys.detail(id);
      const previousDetail = queryClient.getQueryData<Task>(detailKey);
      const previousLists = queryClient.getQueriesData<
        InfiniteData<Paginated<Task>>
      >({
        queryKey: taskKeys.lists(),
      });
      if (previousDetail)
        queryClient.setQueryData(detailKey, { ...previousDetail, status });
      queryClient.setQueriesData<InfiniteData<Paginated<Task>>>(
        { queryKey: taskKeys.lists() },
        current => {
          if (!current) return current;
          return {
            ...current,
            pages: current.pages.map(page => ({
              ...page,
              data: page.data.map(task =>
                task.id === id ? { ...task, status } : task,
              ),
            })),
          };
        },
      );
      return { detailKey, previousDetail, previousLists };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail)
        queryClient.setQueryData(context.detailKey, context.previousDetail);
      context?.previousLists.forEach(([key, value]) =>
        queryClient.setQueryData(key, value),
      );
    },
    onSuccess: task => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      queryClient.setQueriesData<InfiniteData<Paginated<Task>>>(
        { queryKey: taskKeys.lists() },
        current => replaceTaskInPages(current, task),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteTask,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

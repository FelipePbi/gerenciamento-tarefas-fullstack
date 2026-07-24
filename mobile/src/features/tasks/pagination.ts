import type { InfiniteData } from '@tanstack/react-query';

import type { Paginated, Task } from '../../types/domain';

export const TASK_PAGE_SIZE = 7;

export function getNextTaskPageParam(
  lastPage: Paginated<Task>,
  allPages: Paginated<Task>[],
): number | undefined {
  const { hasNext, limit, offset, total } = lastPage.meta;
  if (!hasNext || lastPage.data.length === 0 || limit <= 0) return undefined;

  const offsetOccurrences = allPages.filter(
    page => page.meta.offset === offset,
  ).length;
  if (offsetOccurrences > 1) return undefined;

  const nextOffset = offset + limit;
  if (nextOffset <= offset || nextOffset >= total) return undefined;
  if (allPages.some(page => page.meta.offset === nextOffset)) return undefined;

  return nextOffset;
}

export function mergeUniqueTaskPages(
  data: InfiniteData<Paginated<Task>> | undefined,
): Task[] {
  const tasksById = new Map<string, Task>();
  data?.pages.forEach(page => {
    page.data.forEach(task => tasksById.set(task.id, task));
  });
  return [...tasksById.values()];
}

export function shouldRequestTaskPage({
  force = false,
  isFetching,
  lastRequestedOffset,
  nextOffset,
}: {
  force?: boolean;
  isFetching: boolean;
  lastRequestedOffset: number | undefined;
  nextOffset: number | undefined;
}): boolean {
  if (nextOffset === undefined || isFetching) return false;
  return force || lastRequestedOffset !== nextOffset;
}

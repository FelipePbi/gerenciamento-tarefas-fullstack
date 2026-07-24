import type { InfiniteData } from '@tanstack/react-query';

import {
  getNextTaskPageParam,
  mergeUniqueTaskPages,
  shouldRequestTaskPage,
  TASK_PAGE_SIZE,
} from '../src/features/tasks/pagination';
import type { Paginated, Task } from '../src/types/domain';

function task(id: string, title = id): Task {
  return {
    id,
    title,
    description: null,
    status: 'PENDING',
    createdAt: '2026-07-24T12:00:00.000Z',
    updatedAt: '2026-07-24T12:00:00.000Z',
    teams: [],
  };
}

function page(
  offset: number,
  data: Task[],
  total: number,
  hasNext: boolean,
  limit = TASK_PAGE_SIZE,
): Paginated<Task> {
  return { data, meta: { total, limit, offset, hasNext } };
}

describe('task pagination', () => {
  it('advances in batches of seven and stops at the final page', () => {
    const first = page(
      0,
      Array.from({ length: 7 }, (_, index) => task(`task-${index}`)),
      15,
      true,
    );
    const second = page(
      7,
      Array.from({ length: 7 }, (_, index) => task(`task-${index + 7}`)),
      15,
      true,
    );
    const last = page(14, [task('task-14')], 15, false);

    expect(getNextTaskPageParam(first, [first])).toBe(7);
    expect(getNextTaskPageParam(second, [first, second])).toBe(14);
    expect(getNextTaskPageParam(last, [first, second, last])).toBeUndefined();
  });

  it('stops on empty pages, repeated offsets and invalid metadata', () => {
    const empty = page(0, [], 20, true);
    const repeated = page(0, [task('task-1')], 20, true);
    const invalidLimit = page(0, [task('task-2')], 20, true, 0);

    expect(getNextTaskPageParam(empty, [empty])).toBeUndefined();
    expect(
      getNextTaskPageParam(repeated, [repeated, repeated]),
    ).toBeUndefined();
    expect(getNextTaskPageParam(invalidLimit, [invalidLimit])).toBeUndefined();
  });

  it('deduplicates task ids while retaining the newest page value', () => {
    const first = page(
      0,
      [task('task-1', 'Antigo'), task('task-2')],
      3,
      true,
      2,
    );
    const second = page(
      2,
      [task('task-1', 'Atualizado'), task('task-3')],
      3,
      false,
      2,
    );
    const data: InfiniteData<Paginated<Task>> = {
      pages: [first, second],
      pageParams: [0, 2],
    };

    expect(mergeUniqueTaskPages(data).map(item => item.id)).toEqual([
      'task-1',
      'task-2',
      'task-3',
    ]);
    expect(mergeUniqueTaskPages(data)[0]?.title).toBe('Atualizado');
  });

  it('allows only one automatic request for each offset', () => {
    expect(
      shouldRequestTaskPage({
        isFetching: false,
        lastRequestedOffset: undefined,
        nextOffset: 7,
      }),
    ).toBe(true);
    expect(
      shouldRequestTaskPage({
        isFetching: false,
        lastRequestedOffset: 7,
        nextOffset: 7,
      }),
    ).toBe(false);
    expect(
      shouldRequestTaskPage({
        isFetching: true,
        lastRequestedOffset: 7,
        nextOffset: 14,
      }),
    ).toBe(false);
    expect(
      shouldRequestTaskPage({
        force: true,
        isFetching: false,
        lastRequestedOffset: 7,
        nextOffset: 7,
      }),
    ).toBe(true);
  });
});

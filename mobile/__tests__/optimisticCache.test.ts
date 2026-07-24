import type { InfiniteData } from '@tanstack/react-query';

import { replaceTaskInPages } from '../src/features/tasks/queries';
import type { Paginated, Task } from '../src/types/domain';

test('replaces task status across cached pages', () => {
  const task = {
    id: '1',
    title: 'Teste',
    description: null,
    status: 'PENDING',
    createdAt: '',
    updatedAt: '',
    teams: [],
  } satisfies Task;
  const data: InfiniteData<Paginated<Task>> = {
    pageParams: [0],
    pages: [
      {
        data: [task],
        meta: { total: 1, limit: 20, offset: 0, hasNext: false },
      },
    ],
  };
  const updated = replaceTaskInPages(data, { ...task, status: 'COMPLETED' });
  expect(updated?.pages[0]?.data[0]?.status).toBe('COMPLETED');
  expect(data.pages[0]?.data[0]?.status).toBe('PENDING');
});

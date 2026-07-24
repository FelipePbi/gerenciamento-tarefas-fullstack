import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as navigationModule from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { TaskDetailScreen } from '../src/screens/TaskDetailScreen';
import type { Task } from '../src/types/domain';

type NavigationRecord = {
  method: string;
  args: unknown[];
};

const navigationMock = navigationModule as typeof navigationModule & {
  __getLastNavigation: () => NavigationRecord | undefined;
  __resetNavigation: () => void;
  __setRouteParams: (params: { taskId: string }) => void;
};

const initialTask: Task = {
  id: 'task-1',
  title: 'Revisar interface',
  description: 'Comparar com a avaliacao.',
  status: 'PENDING',
  createdAt: '2026-07-22T00:00:00.000Z',
  updatedAt: '2026-07-22T00:00:00.000Z',
  teams: [
    {
      id: 'team-1',
      name: 'Design',
      colorHex: '#00C7D9',
      createdAt: '2026-07-22T00:00:00.000Z',
      updatedAt: '2026-07-22T00:00:00.000Z',
    },
  ],
};

function setup() {
  let task = initialTask;
  const fetchMock = jest.fn(async (url: string, options: RequestInit = {}) => {
    const method = options.method ?? 'GET';

    if (url.endsWith('/api/tasks/task-1/status') && method === 'PATCH') {
      const body = JSON.parse(String(options.body)) as {
        status: Task['status'];
      };
      task = { ...task, status: body.status };
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: task }),
      };
    }

    if (url.endsWith('/api/tasks/task-1') && method === 'DELETE') {
      return { ok: true, status: 204, json: async () => undefined };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({ data: task }),
    };
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  navigationMock.__setRouteParams({ taskId: initialTask.id });
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const screen = render(
    <QueryClientProvider client={queryClient}>
      <TaskDetailScreen />
    </QueryClientProvider>,
  );

  return { fetchMock, queryClient, screen };
}

afterEach(() => {
  navigationMock.__resetNavigation();
  jest.restoreAllMocks();
});

test('shows colored teams, changes status and opens full editing', async () => {
  const { fetchMock, queryClient, screen } = setup();

  await waitFor(() =>
    expect(screen.getByText('Revisar interface')).toBeTruthy(),
  );
  expect(screen.getByTestId('task-team-chip-team-1')).toHaveStyle({
    backgroundColor: '#00C7D91F',
  });

  fireEvent.press(screen.getByLabelText('Alterar status para Concluida'));
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, options]) =>
          String(url).endsWith('/api/tasks/task-1/status') &&
          options?.method === 'PATCH',
      ),
    ).toBe(true),
  );
  await waitFor(() =>
    expect(
      screen.getByTestId('task-status-action-COMPLETED').props
        .accessibilityState.selected,
    ).toBe(true),
  );
  await waitFor(() =>
    expect(
      screen.getByTestId('task-status-action-COMPLETED').props
        .accessibilityState.busy,
    ).toBe(false),
  );

  fireEvent.press(screen.getByLabelText('Editar tarefa'));
  expect(navigationMock.__getLastNavigation()).toEqual({
    method: 'navigate',
    args: ['TaskForm', { taskId: 'task-1' }],
  });
  screen.unmount();
  queryClient.clear();
});

test('confirms deletion and returns after backend success', async () => {
  const alertSpy = jest
    .spyOn(Alert, 'alert')
    .mockImplementation(() => undefined);
  const { fetchMock, queryClient, screen } = setup();

  await waitFor(() =>
    expect(screen.getByText('Revisar interface')).toBeTruthy(),
  );
  fireEvent.press(screen.getByLabelText('Excluir tarefa'));

  const buttons = alertSpy.mock.calls.at(-1)?.[2];
  buttons?.find(button => button.text === 'Excluir')?.onPress?.();

  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(
        ([url, options]) =>
          String(url).endsWith('/api/tasks/task-1') &&
          options?.method === 'DELETE',
      ),
    ).toBe(true),
  );
  expect(navigationMock.__getLastNavigation()?.method).toBe('goBack');
  screen.unmount();
  queryClient.clear();
});

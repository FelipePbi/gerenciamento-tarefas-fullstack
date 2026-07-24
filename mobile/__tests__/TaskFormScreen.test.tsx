import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as navigationModule from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { TaskFormScreen } from '../src/screens/TaskFormScreen';
import type { Task, Team } from '../src/types/domain';

const navigationMock = navigationModule as typeof navigationModule & {
  __getLastNavigation: () => { method: string } | undefined;
  __resetNavigation: () => void;
  __setRouteParams: (params: { taskId: string }) => void;
};

const teams: Team[] = [
  {
    id: 'team-1',
    name: 'Design',
    colorHex: '#00C7D9',
    createdAt: '2026-07-22T00:00:00.000Z',
    updatedAt: '2026-07-22T00:00:00.000Z',
  },
  {
    id: 'team-2',
    name: 'Engenharia',
    colorHex: '#F3D400',
    createdAt: '2026-07-22T00:00:00.000Z',
    updatedAt: '2026-07-22T00:00:00.000Z',
  },
];

const task: Task = {
  id: 'task-1',
  title: 'Revisar interface',
  description: 'Comparar com a avaliacao.',
  status: 'PENDING',
  createdAt: '2026-07-22T00:00:00.000Z',
  updatedAt: '2026-07-22T00:00:00.000Z',
  teams: [teams[0]!],
};

afterEach(() => {
  navigationMock.__resetNavigation();
  jest.restoreAllMocks();
});

test('edits all task fields through PUT', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const fetchMock = jest.fn(async (url: string, options: RequestInit = {}) => {
    if (url.includes('/api/teams?')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: teams,
          meta: { total: 2, limit: 100, offset: 0, hasNext: false },
        }),
      };
    }

    if (url.endsWith('/api/tasks/task-1') && options.method === 'PUT') {
      const input = JSON.parse(String(options.body));
      return {
        ok: true,
        status: 200,
        json: async () => ({ data: { ...task, ...input, teams } }),
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({ data: task }),
    };
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  navigationMock.__setRouteParams({ taskId: task.id });
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const screen = render(
    <QueryClientProvider client={queryClient}>
      <TaskFormScreen />
    </QueryClientProvider>,
  );

  const title = await screen.findByLabelText('Titulo da tarefa');
  expect(title.props.editable).not.toBe(false);
  await waitFor(() =>
    expect(
      screen.getByTestId('task-team-select').props.accessibilityValue.text,
    ).toBe('Design'),
  );
  fireEvent.changeText(title, 'Revisar interface completa');
  fireEvent.changeText(
    screen.getByLabelText('Descricao'),
    'Campos atualizados pela interface.',
  );

  fireEvent.press(screen.getByTestId('task-team-select'));
  fireEvent.press(screen.getByTestId('task-team-select-option-team-2'));
  fireEvent.press(screen.getByTestId('task-team-select-confirm'));

  fireEvent.press(screen.getByTestId('task-status-select'));
  fireEvent.press(screen.getByTestId('task-status-select-option-COMPLETED'));
  fireEvent.press(screen.getByText('Salvar'));

  await waitFor(() => {
    const putCall = fetchMock.mock.calls.find(
      ([url, options]) =>
        String(url).endsWith('/api/tasks/task-1') && options?.method === 'PUT',
    );
    expect(putCall).toBeTruthy();
    expect(JSON.parse(String(putCall?.[1]?.body))).toEqual({
      title: 'Revisar interface completa',
      description: 'Campos atualizados pela interface.',
      status: 'COMPLETED',
      teamIds: ['team-1', 'team-2'],
    });
  });
  expect(navigationMock.__getLastNavigation()?.method).toBe('goBack');
  screen.unmount();
  queryClient.clear();
});

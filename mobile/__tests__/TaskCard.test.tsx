import { fireEvent, render } from '@testing-library/react-native';

import { TaskCard } from '../src/features/tasks/TaskCard';
import type { Task } from '../src/types/domain';

const task: Task = {
  id: 'task-1',
  title: 'Revisar interface',
  description: 'Comparar com o print.',
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

test('renders colored team chip and visual status then opens detail', () => {
  const onPress = jest.fn();
  const screen = render(<TaskCard task={task} onPress={onPress} />);
  expect(screen.getByText('Revisar interface')).toBeTruthy();
  expect(screen.getByText('Design')).toBeTruthy();
  expect(screen.getByTestId('task-team-chip-team-1')).toHaveStyle({
    backgroundColor: '#00C7D91F',
  });
  expect(screen.getByLabelText('Status: pendente')).toBeTruthy();
  expect(screen.queryByLabelText('Alterar status, atual Pendente')).toBeNull();
  fireEvent.press(screen.getByLabelText('Abrir tarefa Revisar interface'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('renders zero or multiple team chips', () => {
  const props = { onPress: jest.fn() };
  const screen = render(
    <TaskCard
      {...props}
      task={{
        ...task,
        id: 'task-without-team',
        teams: [],
      }}
    />,
  );
  expect(screen.getByText('Sem time')).toBeTruthy();
  expect(screen.getByTestId('task-without-team')).toBeTruthy();

  screen.rerender(
    <TaskCard
      {...props}
      task={{
        ...task,
        teams: [
          ...task.teams,
          {
            ...task.teams[0]!,
            id: 'team-2',
            name: 'Engenharia',
          },
        ],
      }}
    />,
  );
  expect(screen.getByTestId('task-team-chip-team-1')).toBeTruthy();
  expect(screen.getByTestId('task-team-chip-team-2')).toBeTruthy();
  expect(screen.getByText('Design')).toBeTruthy();
  expect(screen.getByText('Engenharia')).toBeTruthy();
});

import { fireEvent, render } from '@testing-library/react-native';

import { TaskFiltersField } from '../src/features/tasks/TaskFiltersField';

const sortOptions = [
  { value: 'createdAt:desc', label: 'Mais recentes' },
  { value: 'updatedAt:desc', label: 'Atualizadas recentemente' },
  { value: 'title:asc', label: 'Titulo A-Z' },
] as const;

describe('TaskFiltersField', () => {
  it('applies status and ordering together', () => {
    const onApply = jest.fn();
    const screen = render(
      <TaskFiltersField
        onApply={onApply}
        sort="createdAt:desc"
        sortOptions={sortOptions}
      />,
    );

    expect(screen.getByText('Todas • Mais recentes')).toBeTruthy();
    fireEvent.press(screen.getByTestId('task-filters'));
    fireEvent.press(screen.getByTestId('task-filters-status-COMPLETED'));
    fireEvent.press(screen.getByTestId('task-filters-sort-title:asc'));
    fireEvent.press(screen.getByText('Aplicar'));

    expect(onApply).toHaveBeenCalledWith('COMPLETED', 'title:asc');
  });

  it('discards draft changes when dismissed', () => {
    const onApply = jest.fn();
    const screen = render(
      <TaskFiltersField
        onApply={onApply}
        sort="createdAt:desc"
        sortOptions={sortOptions}
      />,
    );

    fireEvent.press(screen.getByTestId('task-filters'));
    fireEvent.press(screen.getByTestId('task-filters-status-PENDING'));
    fireEvent.press(
      screen.getByTestId('task-filters-backdrop', {
        includeHiddenElements: true,
      }),
    );

    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByText('Todas • Mais recentes')).toBeTruthy();
  });
});

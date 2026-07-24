import { fireEvent, render } from '@testing-library/react-native';

import { ModalSelectField } from '../src/design-system/ModalSelectField';

const options = [
  { value: 'design', label: 'Design', color: '#00C7D9' },
  { value: 'engineering', label: 'Engenharia', color: '#F3D400' },
] as const;

describe('ModalSelectField', () => {
  it('selects one option and closes immediately in single mode', () => {
    const onChange = jest.fn();
    const screen = render(
      <ModalSelectField
        label="Status"
        mode="single"
        onChange={onChange}
        options={[
          { value: 'PENDING', label: 'Pendente' },
          { value: 'COMPLETED', label: 'Concluida' },
        ]}
        placeholder="Selecione um status"
        selectedValues={[]}
        testID="status-select"
      />,
    );

    fireEvent.press(screen.getByTestId('status-select'));
    fireEvent.press(screen.getByTestId('status-select-option-COMPLETED'));

    expect(onChange).toHaveBeenCalledWith(['COMPLETED']);
    expect(screen.queryByTestId('status-select-option-COMPLETED')).toBeNull();
  });

  it('confirms multiple selected options', () => {
    const onChange = jest.fn();
    const screen = render(
      <ModalSelectField
        label="Time"
        mode="multiple"
        onChange={onChange}
        options={options}
        placeholder="Selecione um time"
        selectedValues={['design']}
        testID="team-select"
      />,
    );

    fireEvent.press(screen.getByTestId('team-select'));
    fireEvent.press(screen.getByTestId('team-select-option-engineering'));
    fireEvent.press(screen.getByTestId('team-select-confirm'));

    expect(onChange).toHaveBeenCalledWith(['design', 'engineering']);
  });

  it('discards draft changes when the backdrop closes the modal', () => {
    const onChange = jest.fn();
    const screen = render(
      <ModalSelectField
        label="Time"
        mode="multiple"
        onChange={onChange}
        options={options}
        placeholder="Selecione um time"
        selectedValues={[]}
        testID="team-select"
      />,
    );

    fireEvent.press(screen.getByTestId('team-select'));
    fireEvent.press(screen.getByTestId('team-select-option-design'));
    fireEvent.press(
      screen.getByTestId('team-select-backdrop', {
        includeHiddenElements: true,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('team-select-option-design')).toBeNull();
  });

  it('does not open when disabled', () => {
    const onChange = jest.fn();
    const screen = render(
      <ModalSelectField
        disabled
        label="Time"
        mode="multiple"
        onChange={onChange}
        options={options}
        placeholder="Selecione um time"
        selectedValues={['design']}
        testID="team-select"
      />,
    );

    const field = screen.getByTestId('team-select');
    expect(field.props.accessibilityState).toEqual({ disabled: true });
    fireEvent.press(field);
    expect(screen.queryByTestId('team-select-option-design')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
});

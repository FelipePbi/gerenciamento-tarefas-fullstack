import { fireEvent, render } from '@testing-library/react-native';

import { ColorPickerField } from '../src/design-system/ColorPickerField';

const options = ['#B8F500', '#00A67D', '#8B7CF6'] as const;

describe('ColorPickerField', () => {
  it('opens, selects a color and closes the modal', () => {
    const onChange = jest.fn();
    const screen = render(
      <ColorPickerField
        label="Cor do time"
        value="#B8F500"
        options={options}
        onChange={onChange}
        testID="color-picker"
      />,
    );

    fireEvent.press(screen.getByTestId('color-picker'));
    expect(screen.getAllByText('Cor do time')).toHaveLength(2);

    fireEvent.press(screen.getByTestId('color-option-#00A67D'));
    expect(onChange).toHaveBeenCalledWith('#00A67D');
    expect(screen.queryByTestId('color-option-#00A67D')).toBeNull();
  });

  it('closes from the backdrop without changing the value', () => {
    const onChange = jest.fn();
    const screen = render(
      <ColorPickerField
        label="Cor do time"
        value="#B8F500"
        options={options}
        onChange={onChange}
        testID="color-picker"
      />,
    );

    fireEvent.press(screen.getByTestId('color-picker'));
    fireEvent.press(
      screen.getByTestId('color-picker-backdrop', {
        includeHiddenElements: true,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('color-option-#B8F500')).toBeNull();
  });
});

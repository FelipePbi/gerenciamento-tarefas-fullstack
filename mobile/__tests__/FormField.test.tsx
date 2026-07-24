import { render } from '@testing-library/react-native';

import { FormField } from '../src/design-system/FormField';

test('disabled form field is read-only and accessible', () => {
  const onChangeText = jest.fn();
  const screen = render(
    <FormField
      disabled
      label="Titulo da tarefa"
      onChangeText={onChangeText}
      showLabel={false}
      size="reference"
      value="Revisar interface"
    />,
  );

  const field = screen.getByLabelText('Titulo da tarefa');
  expect(field.props.editable).toBe(false);
  expect(field.props.accessibilityState).toEqual({ disabled: true });
  expect(onChangeText).not.toHaveBeenCalled();
});

import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

import { colors } from './tokens';

type Props = TextInputProps & {
  label: string;
  error?: string;
  size?: 'default' | 'reference';
  showLabel?: boolean;
  referenceHeight?: number;
  disabled?: boolean;
};

export function FormField({
  label,
  error,
  multiline,
  size = 'default',
  showLabel = true,
  referenceHeight,
  disabled = false,
  accessibilityState,
  editable,
  style,
  ...props
}: Props) {
  const referenceSize = size === 'reference';

  return (
    <View className={referenceSize ? 'mb-4' : 'mb-3'}>
      {showLabel ? (
        <Text className="mb-1.5 text-xs font-semibold text-muted">{label}</Text>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ ...accessibilityState, disabled }}
        editable={disabled ? false : editable}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        textAlignVertical={multiline ? 'top' : 'center'}
        className={`${
          multiline ? 'min-h-24 py-3' : referenceSize ? 'py-0' : 'h-12 py-0'
        } border text-ink ${referenceSize ? '' : 'rounded px-3 text-sm'} ${
          error ? 'border-danger' : 'border-transparent bg-input'
        }`}
        style={[
          referenceSize
            ? {
                height: referenceHeight ?? (multiline ? undefined : 52),
                borderRadius: 6,
                fontSize: 16,
                paddingHorizontal: 16,
              }
            : undefined,
          disabled ? { opacity: 0.45 } : undefined,
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text accessibilityRole="alert" className="mt-1 text-xs text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  size?: 'default' | 'reference';
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  testID,
  size = 'default',
}: Props) {
  const unavailable = Boolean(disabled || loading);
  const referenceSize = size === 'reference';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      testID={testID}
      className={`${
        referenceSize ? '' : 'h-12 rounded'
      } items-center justify-center bg-primary ${
        unavailable ? 'opacity-50' : 'active:bg-primary-pressed'
      }`}
      style={referenceSize ? { height: 52, borderRadius: 6 } : undefined}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text
          className={
            referenceSize
              ? 'font-bold text-white'
              : 'text-sm font-bold text-white'
          }
          style={referenceSize ? { fontSize: 16 } : undefined}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

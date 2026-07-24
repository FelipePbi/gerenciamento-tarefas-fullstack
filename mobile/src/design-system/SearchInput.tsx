import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { colors } from './tokens';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  size?: 'default' | 'reference';
};

export function SearchInput({
  value,
  onChangeText,
  placeholder,
  size = 'default',
}: Props) {
  const referenceSize = size === 'reference';
  const iconSize = referenceSize ? 22 : 17;

  return (
    <View
      className={
        referenceSize
          ? 'flex-row items-center bg-input'
          : 'h-11 flex-row items-center rounded bg-input px-3'
      }
      style={
        referenceSize
          ? { height: 52, borderRadius: 6, paddingHorizontal: 16 }
          : undefined
      }
    >
      <TextInput
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        value={value}
        className={
          referenceSize
            ? 'flex-1 p-0 text-ink'
            : 'h-11 flex-1 p-0 text-sm text-ink'
        }
        style={referenceSize ? { height: 52, fontSize: 16 } : undefined}
      />
      {value ? (
        <Pressable
          accessibilityLabel="Limpar busca"
          hitSlop={10}
          onPress={() => onChangeText('')}
        >
          <X color={colors.muted} size={iconSize} />
        </Pressable>
      ) : (
        <Search color={colors.primary} size={iconSize} />
      )}
    </View>
  );
}

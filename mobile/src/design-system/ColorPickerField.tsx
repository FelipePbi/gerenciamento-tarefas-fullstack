import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { colors } from './tokens';

type Props = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  error?: string;
  testID?: string;
};

export function ColorPickerField({
  label,
  value,
  options,
  onChange,
  error,
  testID,
}: Props) {
  const [open, setOpen] = useState(false);

  const selectColor = (color: string) => {
    onChange(color);
    setOpen(false);
  };

  return (
    <View className="mb-4">
      <Pressable
        accessibilityHint="Abre as opções de cor"
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityValue={{ text: value }}
        onPress={() => setOpen(true)}
        testID={testID}
        className={`h-[52px] flex-row items-center justify-between border bg-input px-4 ${
          error ? 'border-danger' : 'border-transparent'
        }`}
        style={{ borderRadius: 6 }}
      >
        <Text className="text-muted" style={{ fontSize: 16 }}>
          {label}
        </Text>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: value,
          }}
        />
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" className="mt-1 text-xs text-danger">
          {error}
        </Text>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <View className="flex-1 items-center justify-center px-5">
          <Pressable
            accessibilityLabel="Fechar seletor de cor"
            accessibilityRole="button"
            className="absolute inset-0 bg-black/60"
            onPress={() => setOpen(false)}
            testID="color-picker-backdrop"
          />
          <View
            accessibilityViewIsModal
            className="w-full max-w-[350px] bg-surface p-5"
            style={{ borderRadius: 8 }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-bold text-ink" style={{ fontSize: 16 }}>
                {label}
              </Text>
              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                className="h-11 w-11 items-end justify-center"
                hitSlop={4}
                onPress={() => setOpen(false)}
              >
                <X color={colors.ink} size={20} />
              </Pressable>
            </View>
            <View
              accessibilityRole="radiogroup"
              className="flex-row flex-wrap justify-between"
            >
              {options.map(color => {
                const selected = value.toUpperCase() === color.toUpperCase();

                return (
                  <Pressable
                    key={color}
                    accessibilityLabel={`Selecionar cor ${color}`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    className="h-11 w-11 items-center justify-center rounded-full"
                    onPress={() => selectColor(color)}
                    testID={`color-option-${color}`}
                    style={{
                      borderColor: selected ? colors.ink : 'transparent',
                      borderWidth: 2,
                    }}
                  >
                    <View
                      className="h-9 w-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: color }}
                    >
                      {selected ? (
                        <Check color={colors.input} size={18} strokeWidth={3} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

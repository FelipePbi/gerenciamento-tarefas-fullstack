import { Check, ChevronDown, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { colors } from './tokens';

export type ModalSelectOption = {
  value: string;
  label: string;
  color?: string;
};

type Props = {
  label: string;
  placeholder: string;
  mode: 'single' | 'multiple';
  options: readonly ModalSelectOption[];
  selectedValues: readonly string[];
  onChange: (values: string[]) => void;
  error?: string;
  disabled?: boolean;
  multipleValueLabel?: (count: number) => string;
  testID?: string;
};

export function ModalSelectField({
  label,
  placeholder,
  mode,
  options,
  selectedValues,
  onChange,
  error,
  disabled = false,
  multipleValueLabel,
  testID,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draftValues, setDraftValues] = useState<string[]>([]);
  const selectedLabels = useMemo(
    () =>
      selectedValues
        .map(value => options.find(option => option.value === value)?.label)
        .filter((value): value is string => Boolean(value)),
    [options, selectedValues],
  );
  const displayValue =
    selectedLabels.length > 1
      ? multipleValueLabel?.(selectedLabels.length) ??
        `${selectedLabels.length} selecionados`
      : selectedLabels[0] ?? placeholder;

  const openModal = () => {
    setDraftValues([...selectedValues]);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const selectOption = (value: string) => {
    if (mode === 'single') {
      onChange([value]);
      setOpen(false);
      return;
    }
    setDraftValues(current =>
      current.includes(value)
        ? current.filter(selected => selected !== value)
        : [...current, value],
    );
  };

  const confirmMultipleSelection = () => {
    onChange(draftValues);
    setOpen(false);
  };

  return (
    <View className="mb-4">
      <Pressable
        accessibilityHint={
          disabled ? undefined : `Abre as opções de ${label.toLowerCase()}`
        }
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityValue={{ text: displayValue }}
        className={`h-[52px] flex-row items-center justify-between border bg-input px-4 ${
          error ? 'border-danger' : 'border-transparent'
        }`}
        disabled={disabled}
        onPress={openModal}
        style={{ borderRadius: 6, opacity: disabled ? 0.45 : 1 }}
        testID={testID}
      >
        <Text
          className={selectedLabels.length ? 'text-ink' : 'text-muted'}
          numberOfLines={1}
          style={{ flex: 1, fontSize: 16 }}
        >
          {displayValue}
        </Text>
        <ChevronDown color={colors.ink} size={20} strokeWidth={1.5} />
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" className="mt-1 text-xs text-danger">
          {error}
        </Text>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={closeModal}
        transparent
        visible={open}
      >
        <View className="flex-1 items-center justify-center px-5">
          <Pressable
            accessibilityLabel={`Fechar seletor de ${label.toLowerCase()}`}
            className="absolute inset-0 bg-black/60"
            onPress={closeModal}
            testID={`${testID ?? 'modal-select'}-backdrop`}
          />
          <View
            accessibilityViewIsModal
            className="max-h-[70%] w-full max-w-[350px] bg-surface p-5"
            style={{ borderRadius: 8 }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-bold text-ink" style={{ fontSize: 16 }}>
                {label}
              </Text>
              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                className="h-11 w-11 items-end justify-center"
                onPress={closeModal}
              >
                <X color={colors.ink} size={20} />
              </Pressable>
            </View>
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={options.length > 6}
              style={{ maxHeight: 360 }}
            >
              <View
                accessibilityRole={mode === 'single' ? 'radiogroup' : undefined}
              >
                {options.map(option => {
                  const selected = draftValues.includes(option.value);

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityLabel={option.label}
                      accessibilityRole={
                        mode === 'single' ? 'radio' : 'checkbox'
                      }
                      accessibilityState={
                        mode === 'single' ? { selected } : { checked: selected }
                      }
                      className="min-h-[52px] flex-row items-center border-b border-line"
                      onPress={() => selectOption(option.value)}
                      testID={`${testID ?? 'modal-select'}-option-${
                        option.value
                      }`}
                    >
                      {option.color ? (
                        <View
                          className="mr-3 h-4 w-4 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                      ) : null}
                      <Text className="flex-1 text-sm text-ink">
                        {option.label}
                      </Text>
                      {selected ? (
                        <Check
                          color={colors.primary}
                          size={20}
                          strokeWidth={2}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            {mode === 'multiple' ? (
              <Pressable
                accessibilityRole="button"
                className="mt-4 h-11 items-center justify-center bg-primary"
                onPress={confirmMultipleSelection}
                style={{ borderRadius: 6 }}
                testID={`${testID ?? 'modal-select'}-confirm`}
              >
                <Text className="text-sm font-bold text-white">Concluir</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

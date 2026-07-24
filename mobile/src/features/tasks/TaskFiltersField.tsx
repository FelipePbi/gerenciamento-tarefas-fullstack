import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '../../design-system/PrimaryButton';
import { colors } from '../../design-system/tokens';
import type { TaskStatus } from '../../types/domain';
import { statusLabels, statusOrder } from './status';

type SortOption<TSort extends string> = {
  value: TSort;
  label: string;
};

type Props<TSort extends string> = {
  status?: TaskStatus;
  sort: TSort;
  sortOptions: readonly SortOption<TSort>[];
  onApply: (status: TaskStatus | undefined, sort: TSort) => void;
  testID?: string;
};

const allStatusOptions = [
  { value: 'ALL', label: 'Todas' },
  ...statusOrder.map(value => ({ value, label: statusLabels[value] })),
] as const;

export function TaskFiltersField<TSort extends string>({
  status,
  sort,
  sortOptions,
  onApply,
  testID = 'task-filters',
}: Props<TSort>) {
  const [open, setOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<TaskStatus | undefined>(
    status,
  );
  const [draftSort, setDraftSort] = useState<TSort>(sort);
  const statusLabel = status ? statusLabels[status] : 'Todas';
  const sortLabel =
    sortOptions.find(option => option.value === sort)?.label ??
    sortOptions[0]?.label ??
    '';
  const summary = `${statusLabel} • ${sortLabel}`;

  const openModal = () => {
    setDraftStatus(status);
    setDraftSort(sort);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const apply = () => {
    onApply(draftStatus, draftSort);
    setOpen(false);
  };

  return (
    <View className="mt-3">
      <Pressable
        accessibilityHint="Abre opções de status e ordenação"
        accessibilityLabel="Filtros e ordenação"
        accessibilityRole="button"
        accessibilityValue={{ text: summary }}
        className="h-[52px] flex-row items-center bg-input px-4"
        onPress={openModal}
        style={{ borderRadius: 6 }}
        testID={testID}
      >
        <SlidersHorizontal color={colors.primary} size={20} strokeWidth={1.5} />
        <Text
          className="ml-3 flex-1 text-ink"
          numberOfLines={1}
          style={{ fontSize: 16 }}
        >
          {summary}
        </Text>
        <ChevronDown color={colors.ink} size={20} strokeWidth={1.5} />
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={closeModal}
        transparent
        visible={open}
      >
        <View className="flex-1 items-center justify-center px-5">
          <Pressable
            accessibilityLabel="Fechar filtros"
            className="absolute inset-0 bg-black/60"
            onPress={closeModal}
            testID={`${testID}-backdrop`}
          />
          <View
            accessibilityViewIsModal
            className="max-h-[80%] w-full max-w-[350px] bg-surface p-5"
            style={{ borderRadius: 8 }}
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-bold text-ink" style={{ fontSize: 18 }}>
                Filtros e ordenação
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
              showsVerticalScrollIndicator={false}
            >
              <Text className="pb-1 pt-2 text-xs font-bold uppercase text-muted">
                Status
              </Text>
              <View accessibilityRole="radiogroup">
                {allStatusOptions.map(option => {
                  const selected =
                    option.value === 'ALL'
                      ? draftStatus === undefined
                      : draftStatus === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityLabel={option.label}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className="min-h-[52px] flex-row items-center border-b border-line"
                      onPress={() =>
                        setDraftStatus(
                          option.value === 'ALL' ? undefined : option.value,
                        )
                      }
                      testID={`${testID}-status-${option.value}`}
                    >
                      <Text className="flex-1 text-sm text-ink">
                        {option.label}
                      </Text>
                      {selected ? (
                        <Check color={colors.primary} size={20} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>

              <Text className="pb-1 pt-5 text-xs font-bold uppercase text-muted">
                Ordenação
              </Text>
              <View accessibilityRole="radiogroup">
                {sortOptions.map(option => {
                  const selected = draftSort === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityLabel={option.label}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className="min-h-[52px] flex-row items-center border-b border-line"
                      onPress={() => setDraftSort(option.value)}
                      testID={`${testID}-sort-${option.value}`}
                    >
                      <Text className="flex-1 text-sm text-ink">
                        {option.label}
                      </Text>
                      {selected ? (
                        <Check color={colors.primary} size={20} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View className="mt-4">
              <PrimaryButton label="Aplicar" onPress={apply} size="reference" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

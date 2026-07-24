import { Pressable, Text, View } from 'react-native';

import type { Task } from '../../types/domain';
import { TaskTeamChips } from './TaskTeamChips';

type Props = {
  task: Task;
  onPress: () => void;
};

const compactStatusLabels: Record<Task['status'], string> = {
  PENDING: 'pendente',
  IN_PROGRESS: 'em progresso',
  COMPLETED: 'concluída',
};

const compactStatusColors: Record<Task['status'], string> = {
  PENDING: '#D6001C',
  IN_PROGRESS: '#D5A900',
  COMPLETED: '#70B600',
};

export function TaskCard({ task, onPress }: Props) {
  return (
    <Pressable
      accessibilityLabel={`Abrir tarefa ${task.title}`}
      accessibilityRole="button"
      onPress={onPress}
      className="mb-4 bg-surface active:opacity-80"
      style={{ minHeight: 132, borderRadius: 6, padding: 16 }}
    >
      <View className="flex-row items-start">
        <Text
          className="flex-1 font-bold text-ink"
          numberOfLines={2}
          style={{ fontSize: 16, lineHeight: 18, marginRight: 12 }}
        >
          {task.title}
        </Text>
        <View
          accessibilityLabel={`Status: ${compactStatusLabels[task.status]}`}
          style={{
            alignItems: 'center',
            backgroundColor: compactStatusColors[task.status],
            borderRadius: 9,
            height: 18,
            justifyContent: 'center',
            minWidth: 62,
            paddingHorizontal: 10,
          }}
        >
          <Text className="font-bold text-white" style={{ fontSize: 10 }}>
            {compactStatusLabels[task.status]}
          </Text>
        </View>
      </View>
      {task.description ? (
        <Text
          className="mt-2 text-ink"
          numberOfLines={4}
          style={{ fontSize: 14, lineHeight: 15, flex: 1 }}
        >
          {task.description}
        </Text>
      ) : null}
      <View className="mt-1">
        <TaskTeamChips teams={task.teams} />
      </View>
    </Pressable>
  );
}

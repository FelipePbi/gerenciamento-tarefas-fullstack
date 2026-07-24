import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckSquare2, Pencil, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { AsyncState } from '../design-system/AsyncState';
import { ScreenFrame } from '../design-system/ScreenFrame';
import { colors } from '../design-system/tokens';
import { TaskTeamChips } from '../features/tasks/TaskTeamChips';
import {
  useDeleteTask,
  useTask,
  useUpdateTaskStatus,
} from '../features/tasks/queries';
import {
  statusColors,
  statusLabels,
  statusOrder,
} from '../features/tasks/status';
import type { RootStackParamList } from '../navigation/types';
import type { TaskStatus } from '../types/domain';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;
type Route = RouteProp<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { taskId } = route.params;
  const taskQuery = useTask(taskId);
  const statusMutation = useUpdateTaskStatus();
  const deleteMutation = useDeleteTask();
  const task = taskQuery.data;

  const updateStatus = (status: TaskStatus) => {
    if (!task || task.status === status || statusMutation.isPending) return;
    statusMutation.mutate(
      { id: task.id, status },
      {
        onError: error =>
          Alert.alert('Nao foi possivel alterar o status', error.message),
      },
    );
  };

  const confirmDelete = () => {
    if (!task) return;
    Alert.alert('Excluir tarefa?', 'Esta acao nao pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(task.id, {
            onSuccess: () => navigation.goBack(),
            onError: error => Alert.alert('Falha ao excluir', error.message),
          }),
      },
    ]);
  };

  const actions = task ? (
    <View className="flex-row">
      <Pressable
        accessibilityLabel="Editar tarefa"
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center"
        disabled={deleteMutation.isPending}
        onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
      >
        <Pencil color={colors.ink} size={21} strokeWidth={1.5} />
      </Pressable>
      <Pressable
        accessibilityLabel="Excluir tarefa"
        accessibilityRole="button"
        accessibilityState={{
          busy: deleteMutation.isPending,
          disabled: deleteMutation.isPending,
        }}
        className="h-11 w-11 items-center justify-center"
        disabled={deleteMutation.isPending}
        onPress={confirmDelete}
      >
        <Trash2 color={colors.ink} size={21} strokeWidth={1.5} />
      </Pressable>
    </View>
  ) : undefined;

  if (taskQuery.isLoading) {
    return (
      <ScreenFrame onBack={() => navigation.goBack()}>
        <AsyncState kind="loading" title="Carregando tarefa..." />
      </ScreenFrame>
    );
  }

  if (taskQuery.isError || !task) {
    return (
      <ScreenFrame onBack={() => navigation.goBack()}>
        <AsyncState
          kind="error"
          message={taskQuery.error?.message}
          onRetry={() => void taskQuery.refetch()}
        />
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame action={actions} onBack={() => navigation.goBack()}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 28,
          paddingHorizontal: 20,
        }}
      >
        <View className="items-center pb-10 pt-14">
          <CheckSquare2 color={colors.primary} size={42} strokeWidth={1.5} />
          <Text
            className="mt-6 text-center font-bold text-ink"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            {task.title}
          </Text>
          <Text className="mt-2 text-sm text-muted">detalhes da tarefa</Text>
        </View>

        <View
          className="bg-surface p-4"
          style={{ borderRadius: 6, minHeight: 112 }}
        >
          <Text className="text-xs font-bold uppercase text-muted">
            Descricao
          </Text>
          <Text className="mt-3 text-base leading-6 text-ink">
            {task.description || 'Sem descricao.'}
          </Text>
        </View>

        <Text className="mb-3 mt-6 text-xs font-bold uppercase text-muted">
          Status - toque para alterar
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {statusOrder.map(status => {
            const selected = task.status === status;
            const disabled = statusMutation.isPending;

            return (
              <Pressable
                accessibilityLabel={`Alterar status para ${statusLabels[status]}`}
                accessibilityRole="button"
                accessibilityState={{
                  busy: disabled,
                  disabled,
                  selected,
                }}
                disabled={disabled}
                key={status}
                onPress={() => updateStatus(status)}
                style={{
                  alignItems: 'center',
                  backgroundColor: selected
                    ? statusColors[status]
                    : 'transparent',
                  borderColor: statusColors[status],
                  borderRadius: 6,
                  borderWidth: 1,
                  flex: 1,
                  justifyContent: 'center',
                  minHeight: 48,
                  opacity: disabled ? 0.55 : 1,
                  paddingHorizontal: 4,
                }}
                testID={`task-status-action-${status}`}
              >
                <Text
                  numberOfLines={2}
                  style={{
                    color: selected ? '#FFFFFF' : statusColors[status],
                    fontSize: 12,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  {statusLabels[status]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-3 mt-7 text-xs font-bold uppercase text-muted">
          Times
        </Text>
        <TaskTeamChips teams={task.teams} />
      </ScrollView>
    </ScreenFrame>
  );
}

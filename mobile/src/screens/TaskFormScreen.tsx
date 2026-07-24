import { zodResolver } from '@hookform/resolvers/zod';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckSquare2, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod/v3';

import { AsyncState } from '../design-system/AsyncState';
import { FormField } from '../design-system/FormField';
import { ModalSelectField } from '../design-system/ModalSelectField';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { ScreenFrame } from '../design-system/ScreenFrame';
import { colors } from '../design-system/tokens';
import { useInfiniteTeams } from '../features/teams/queries';
import { useDeleteTask, useSaveTask, useTask } from '../features/tasks/queries';
import { statusLabels, statusOrder } from '../features/tasks/status';
import type { RootStackParamList } from '../navigation/types';
import type { TaskInput, TaskStatus } from '../types/domain';

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Titulo deve ter ao menos 3 caracteres.')
    .max(200),
  description: z.string().trim().max(2000, 'Use no maximo 2000 caracteres.'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
    required_error: 'Selecione um status.',
  }),
  teamIds: z.array(z.string()),
});
type Values = z.infer<typeof taskFormSchema>;
type Navigation = NativeStackNavigationProp<RootStackParamList, 'TaskForm'>;
type Route = RouteProp<RootStackParamList, 'TaskForm'>;

export function toTaskInput(values: Values): TaskInput {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    status: values.status,
    teamIds: values.teamIds,
  };
}

export function TaskFormScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const taskId = route.params?.taskId;
  const initialTeamId = route.params?.initialTeamId;
  const taskQuery = useTask(taskId);
  const teamsQuery = useInfiniteTeams('', 100);
  const saveMutation = useSaveTask(taskId);
  const deleteMutation = useDeleteTask();
  const teams = useMemo(
    () => teamsQuery.data?.pages.flatMap(page => page.data) ?? [],
    [teamsQuery.data],
  );
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: undefined,
      teamIds: initialTeamId ? [initialTeamId] : [],
    },
  });
  const selectedStatus = watch('status');
  const selectedTeams = watch('teamIds');

  useEffect(() => {
    if (taskQuery.data) {
      reset({
        title: taskQuery.data.title,
        description: taskQuery.data.description ?? '',
        status: taskQuery.data.status,
        teamIds: taskQuery.data.teams.map(team => team.id),
      });
    }
  }, [reset, taskQuery.data]);

  const submit = handleSubmit(values => {
    saveMutation.mutate(toTaskInput(values), {
      onSuccess: () => {
        Alert.alert(taskId ? 'Tarefa atualizada' : 'Tarefa criada');
        navigation.goBack();
      },
      onError: error => Alert.alert('Nao foi possivel salvar', error.message),
    });
  });

  const confirmDelete = () => {
    if (!taskId) return;
    Alert.alert('Excluir tarefa?', 'Esta acao nao pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(taskId, {
            onSuccess: () => navigation.goBack(),
            onError: error => Alert.alert('Falha ao excluir', error.message),
          }),
      },
    ]);
  };

  const deleteAction = taskId ? (
    <Pressable
      accessibilityLabel="Excluir tarefa"
      accessibilityRole="button"
      accessibilityState={{ busy: deleteMutation.isPending }}
      disabled={deleteMutation.isPending}
      className="h-11 w-11 items-end justify-center"
      onPress={confirmDelete}
    >
      <Trash2 color={colors.ink} size={20} strokeWidth={1.5} />
    </Pressable>
  ) : undefined;

  if (taskId && taskQuery.isLoading)
    return (
      <ScreenFrame onBack={() => navigation.goBack()}>
        <AsyncState kind="loading" />
      </ScreenFrame>
    );
  if (taskId && taskQuery.isError)
    return (
      <ScreenFrame onBack={() => navigation.goBack()}>
        <AsyncState
          kind="error"
          message={taskQuery.error.message}
          onRetry={() => void taskQuery.refetch()}
        />
      </ScreenFrame>
    );

  return (
    <ScreenFrame action={deleteAction} onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20,
            paddingHorizontal: 20,
          }}
        >
          <View className="items-center pb-7 pt-28">
            <CheckSquare2 color={colors.primary} size={38} strokeWidth={1.5} />
            <Text
              className="mt-6 font-bold text-ink"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              {taskId ? 'Editar tarefa' : 'Nova tarefa'}
            </Text>
            <Text
              className="mt-1.5 text-muted"
              style={{ fontSize: 14, lineHeight: 20 }}
            >
              crie seu time para gerenciar as tarefas
            </Text>
          </View>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <FormField
                error={errors.title?.message}
                label="Titulo da tarefa"
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Título da tarefa"
                showLabel={false}
                size="reference"
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <FormField
                error={errors.description?.message}
                label="Descricao"
                multiline
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder="Descrição"
                referenceHeight={136}
                showLabel={false}
                size="reference"
                value={field.value}
              />
            )}
          />
          <ModalSelectField
            error={errors.teamIds?.message}
            label="Time"
            mode="multiple"
            multipleValueLabel={count => `${count} times selecionados`}
            onChange={values =>
              setValue('teamIds', values, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            options={teams.map(team => ({
              value: team.id,
              label: team.name,
              color: team.colorHex,
            }))}
            placeholder={
              teamsQuery.isLoading ? 'Carregando times...' : 'Selecione um time'
            }
            selectedValues={selectedTeams}
            testID="task-team-select"
          />
          <ModalSelectField
            error={errors.status?.message}
            label="Status"
            mode="single"
            onChange={values =>
              setValue('status', values[0] as TaskStatus, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            options={statusOrder.map(status => ({
              value: status,
              label: statusLabels[status],
            }))}
            placeholder="Selecione um status"
            selectedValues={selectedStatus ? [selectedStatus] : []}
            testID="task-status-select"
          />
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'flex-end',
              minHeight: 92,
            }}
          >
            <PrimaryButton
              label={taskId ? 'Salvar' : 'Criar'}
              loading={saveMutation.isPending}
              onPress={() => void submit()}
              size="reference"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenFrame>
  );
}

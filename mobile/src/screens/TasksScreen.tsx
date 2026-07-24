import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { AsyncState } from '../design-system/AsyncState';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { ScreenFrame } from '../design-system/ScreenFrame';
import { SearchInput } from '../design-system/SearchInput';
import { colors } from '../design-system/tokens';
import { TaskCard } from '../features/tasks/TaskCard';
import { TaskFiltersField } from '../features/tasks/TaskFiltersField';
import { useInfiniteTasks } from '../features/tasks/queries';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { RootStackParamList } from '../navigation/types';
import type { TaskStatus } from '../types/domain';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Tasks'>;
type Route = RouteProp<RootStackParamList, 'Tasks'>;
const sortOptions = [
  { value: 'createdAt:desc', label: 'Mais recentes' },
  { value: 'updatedAt:desc', label: 'Atualizadas recentemente' },
  { value: 'title:asc', label: 'Titulo A-Z' },
] as const;

export function TasksScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const teamId = route.params?.teamId;
  const isTeamList = Boolean(teamId);
  const teamName = route.params?.teamName;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | undefined>();
  const [sort, setSort] =
    useState<(typeof sortOptions)[number]['value']>('createdAt:desc');
  const debouncedSearch = useDebouncedValue(search);
  const query = useInfiniteTasks({
    teamId,
    status,
    search: debouncedSearch,
    sort,
  });
  const tasks = useMemo(
    () => query.data?.pages.flatMap(page => page.data) ?? [],
    [query.data],
  );

  return (
    <ScreenFrame
      onBack={() => navigation.goBack()}
      size="reference"
      title={isTeamList && teamName ? `Tarefas - ${teamName}` : 'Tarefas'}
      subtitle={isTeamList ? 'Tarefas do time' : 'Todas as tarefas'}
    >
      <View className="flex-1 pb-3" style={{ paddingHorizontal: 20 }}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Busque uma tarefa"
          size="reference"
        />
        <TaskFiltersField
          onApply={(nextStatus, nextSort) => {
            setStatus(nextStatus);
            setSort(nextSort);
          }}
          sort={sort}
          sortOptions={sortOptions}
          status={status}
        />
        {query.isLoading ? (
          <AsyncState kind="loading" title="Carregando tarefas..." />
        ) : null}
        {query.isError && tasks.length === 0 ? (
          <AsyncState
            kind="error"
            message={query.error.message}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {!query.isLoading && !(query.isError && tasks.length === 0) ? (
          <FlatList
            className="mt-3"
            contentContainerClassName={
              tasks.length === 0 ? 'flex-grow' : 'pb-3'
            }
            data={tasks}
            keyExtractor={task => task.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onPress={() =>
                  navigation.navigate('TaskDetail', { taskId: item.id })
                }
              />
            )}
            ListEmptyComponent={
              <AsyncState
                kind="empty"
                title="Nenhuma tarefa encontrada"
                message="Ajuste os filtros ou crie uma nova tarefa."
              />
            }
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <AsyncState kind="loading" title="Carregando mais..." />
              ) : null
            }
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage)
                void query.fetchNextPage();
            }}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                tintColor={colors.primary}
                refreshing={query.isRefetching && !query.isFetchingNextPage}
                onRefresh={() => void query.refetch()}
              />
            }
          />
        ) : null}
        <View className="mt-3">
          <PrimaryButton
            label="Nova Tarefa"
            onPress={() =>
              navigation.navigate('TaskForm', { initialTeamId: teamId })
            }
            size="reference"
          />
        </View>
      </View>
    </ScreenFrame>
  );
}

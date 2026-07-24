import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { AsyncState } from '../design-system/AsyncState';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { ScreenFrame } from '../design-system/ScreenFrame';
import { SearchInput } from '../design-system/SearchInput';
import { colors } from '../design-system/tokens';
import { TaskCard } from '../features/tasks/TaskCard';
import { useInfiniteTasks } from '../features/tasks/queries';
import { statusLabels, statusOrder } from '../features/tasks/status';
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
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | undefined>();
  const [sortIndex, setSortIndex] = useState(0);
  const debouncedSearch = useDebouncedValue(search);
  const sort = sortOptions[sortIndex] ?? sortOptions[0];
  const query = useInfiniteTasks({
    teamId,
    status,
    search: debouncedSearch,
    sort: sort.value,
  });
  const tasks = useMemo(
    () => query.data?.pages.flatMap(page => page.data) ?? [],
    [query.data],
  );

  return (
    <ScreenFrame
      onBack={() => navigation.goBack()}
      title={isTeamList ? undefined : 'Tarefas'}
      subtitle={isTeamList ? undefined : 'Todas as tarefas'}
    >
      <View className="flex-1 pb-3" style={{ paddingHorizontal: 20 }}>
        {isTeamList ? (
          <View className="items-center pb-12">
            <Text
              className="font-bold text-ink"
              style={{ fontSize: 22, lineHeight: 28 }}
            >
              Tarefas
            </Text>
            <Text
              className="mt-1 text-muted"
              style={{ fontSize: 14, lineHeight: 20 }}
            >
              adicione a galera e separe os times
            </Text>
          </View>
        ) : (
          <>
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Busque uma tarefa"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3 max-h-10"
              contentContainerClassName="gap-2"
            >
              <Pressable
                onPress={() => setStatus(undefined)}
                className={`h-8 justify-center rounded-full border px-3 ${
                  !status ? 'border-primary bg-primary' : 'border-line'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    !status ? 'text-white' : 'text-muted'
                  }`}
                >
                  Todas
                </Text>
              </Pressable>
              {statusOrder.map(value => (
                <Pressable
                  key={value}
                  onPress={() => setStatus(value)}
                  className={`h-8 justify-center rounded-full border px-3 ${
                    status === value
                      ? 'border-primary bg-primary'
                      : 'border-line'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      status === value ? 'text-white' : 'text-muted'
                    }`}
                  >
                    {statusLabels[value]}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityLabel="Alterar ordenacao"
                onPress={() =>
                  setSortIndex(index => (index + 1) % sortOptions.length)
                }
                className="h-8 justify-center rounded-full border border-line px-3"
              >
                <Text className="text-xs font-semibold text-muted">
                  {sort.label}
                </Text>
              </Pressable>
            </ScrollView>
          </>
        )}
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
            className={isTeamList ? '' : 'mt-3'}
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

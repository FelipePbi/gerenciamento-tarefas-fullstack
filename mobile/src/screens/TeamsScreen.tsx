import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClipboardList } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, View } from 'react-native';

import { AsyncState } from '../design-system/AsyncState';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { ScreenFrame } from '../design-system/ScreenFrame';
import { SearchInput } from '../design-system/SearchInput';
import { colors } from '../design-system/tokens';
import { TeamCard } from '../features/teams/TeamCard';
import { useDeleteTeam, useInfiniteTeams } from '../features/teams/queries';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { RootStackParamList } from '../navigation/types';
import type { Team } from '../types/domain';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Teams'>;

export function TeamsScreen() {
  const navigation = useNavigation<Navigation>();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const query = useInfiniteTeams(debouncedSearch);
  const deleteTeam = useDeleteTeam();
  const teams = useMemo(
    () => query.data?.pages.flatMap(page => page.data) ?? [],
    [query.data],
  );

  const confirmDelete = (team: Team) => {
    Alert.alert(
      'Excluir time?',
      'As tarefas serao preservadas e apenas os vinculos removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () =>
            deleteTeam.mutate(team.id, {
              onSuccess: () =>
                Alert.alert('Time excluido', 'Tarefas foram preservadas.'),
              onError: error => Alert.alert('Falha ao excluir', error.message),
            }),
        },
      ],
    );
  };

  const openMenu = (team: Team) => {
    Alert.alert(team.name, 'Gerencie este time.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Editar',
        onPress: () => navigation.navigate('TeamForm', { teamId: team.id }),
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => confirmDelete(team),
      },
    ]);
  };

  return (
    <ScreenFrame
      title="Times"
      subtitle="Acesse um dos times"
      size="reference"
      action={
        <Pressable
          accessibilityLabel="Ver todas as tarefas"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => navigation.navigate('Tasks')}
        >
          <ClipboardList color={colors.primary} size={24} />
        </Pressable>
      }
    >
      <View className="flex-1 pb-3" style={{ paddingHorizontal: 20 }}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Busque um time"
          size="reference"
        />
        {query.isLoading ? (
          <AsyncState kind="loading" title="Carregando times..." />
        ) : null}
        {query.isError && teams.length === 0 ? (
          <AsyncState
            kind="error"
            message={query.error.message}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {!query.isLoading && !query.isError ? (
          <FlatList
            style={{ marginTop: 24 }}
            contentContainerClassName={
              teams.length === 0 ? 'flex-grow' : 'pb-3'
            }
            data={teams}
            keyExtractor={team => team.id}
            renderItem={({ item }) => (
              <TeamCard
                team={item}
                onMenu={() => openMenu(item)}
                onPress={() =>
                  navigation.navigate('Tasks', {
                    teamId: item.id,
                    teamName: item.name,
                  })
                }
              />
            )}
            ListEmptyComponent={
              <AsyncState
                kind="empty"
                title={
                  debouncedSearch
                    ? 'Nenhum time encontrado'
                    : 'Nenhum time cadastrado'
                }
                message={
                  debouncedSearch
                    ? 'Tente outro termo de busca.'
                    : 'Crie o primeiro time para comecar.'
                }
              />
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
        <PrimaryButton
          label="Criar time"
          onPress={() => navigation.navigate('TeamForm')}
          size="reference"
        />
      </View>
    </ScreenFrame>
  );
}

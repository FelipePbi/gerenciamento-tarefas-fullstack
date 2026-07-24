import { ChevronRight, MoreHorizontal } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../../design-system/tokens';
import type { Team } from '../../types/domain';
import { TeamListIcon } from './TeamIcons';

type Props = { team: Team; onPress: () => void; onMenu: () => void };

export function TeamCard({ team, onPress, onMenu }: Props) {
  return (
    <Pressable
      accessibilityLabel={`Abrir tarefas do time ${team.name}`}
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center bg-surface active:opacity-80"
      style={{
        height: 88,
        borderRadius: 6,
        marginBottom: 16,
        paddingHorizontal: 24,
      }}
    >
      <TeamListIcon
        color={team.colorHex}
        size={32}
        testID={`team-icon-${team.id}`}
      />
      <View className="ml-5 flex-1">
        <Text
          className="font-medium text-ink"
          numberOfLines={1}
          style={{ fontSize: 16 }}
        >
          {team.name}
        </Text>
        {team._count ? (
          <Text className="mt-0.5 text-muted" style={{ fontSize: 12 }}>
            {team._count.taskTeams} tarefas
          </Text>
        ) : null}
      </View>
      <Pressable
        accessibilityLabel={`Opcoes do time ${team.name}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={event => {
          event.stopPropagation();
          onMenu();
        }}
        className="items-center justify-center"
        style={{ height: 44, width: 44 }}
      >
        <MoreHorizontal color={colors.muted} size={20} />
      </Pressable>
      <ChevronRight color={colors.ink} size={20} strokeWidth={1.3} />
    </Pressable>
  );
}

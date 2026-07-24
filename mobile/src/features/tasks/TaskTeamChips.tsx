import { Text, View } from 'react-native';

import type { Team } from '../../types/domain';

type Props = {
  teams: readonly Team[];
};

export function TaskTeamChips({ teams }: Props) {
  if (teams.length === 0) {
    return (
      <Text className="text-xs text-muted" testID="task-without-team">
        Sem time
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {teams.map(team => (
        <View
          accessible
          accessibilityLabel={`Time ${team.name}`}
          key={team.id}
          style={{
            alignItems: 'center',
            backgroundColor: `${team.colorHex}1F`,
            borderRadius: 999,
            justifyContent: 'center',
            paddingHorizontal: 6,
          }}
          testID={`task-team-chip-${team.id}`}
        >
          <Text
            numberOfLines={1}
            style={{ color: team.colorHex, fontSize: 12, fontWeight: '700' }}
          >
            {team.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

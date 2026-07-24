import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Teams: undefined;
  TeamForm: { teamId?: string } | undefined;
  Tasks: { teamId?: string; teamName?: string } | undefined;
  TaskDetail: { taskId: string };
  TaskForm: { taskId?: string; initialTeamId?: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type NestedNavigation = NavigatorScreenParams<RootStackParamList>;

import { AlertCircle, Inbox } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { colors } from './tokens';

type Props = {
  kind: 'loading' | 'empty' | 'error';
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function AsyncState({ kind, title, message, onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {kind === 'loading' ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : null}
      {kind === 'empty' ? (
        <Inbox color={colors.muted} size={34} strokeWidth={1.4} />
      ) : null}
      {kind === 'error' ? (
        <AlertCircle color={colors.danger} size={34} strokeWidth={1.4} />
      ) : null}
      <Text className="mt-4 text-center text-base font-bold text-ink">
        {title ??
          (kind === 'loading'
            ? 'Carregando...'
            : kind === 'empty'
            ? 'Nada por aqui'
            : 'Algo deu errado')}
      </Text>
      {message ? (
        <Text className="mt-2 text-center text-sm leading-5 text-muted">
          {message}
        </Text>
      ) : null}
      {kind === 'error' && onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          className="mt-5 rounded bg-surface px-5 py-3"
        >
          <Text className="font-bold text-primary">Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

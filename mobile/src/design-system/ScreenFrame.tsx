import { useNetInfo } from '@react-native-community/netinfo';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from './tokens';

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  size?: 'default' | 'reference';
  children: ReactNode;
};

export function ScreenFrame({
  title,
  subtitle,
  onBack,
  action,
  size = 'default',
  children,
}: Props) {
  const network = useNetInfo();
  const offline = network.isConnected === false;
  const referenceSize = size === 'reference';
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      {offline ? (
        <View accessibilityRole="alert" className="bg-warning px-4 py-1.5">
          <Text className="text-center text-xs font-bold text-input">
            Modo offline - dados salvos
          </Text>
        </View>
      ) : null}
      {(title || onBack || action) && (
        <View className="min-h-24 justify-center px-5 pt-2">
          {onBack ? (
            <Pressable
              accessibilityLabel="Voltar"
              accessibilityRole="button"
              hitSlop={12}
              onPress={onBack}
              className="absolute left-5 top-6 z-10 h-11 w-11 justify-center"
            >
              <ChevronLeft color={colors.ink} size={23} strokeWidth={1.5} />
            </Pressable>
          ) : null}
          {action ? (
            <View className="absolute right-5 top-6 z-10">{action}</View>
          ) : null}
          {title ? (
            <Text
              className={
                referenceSize
                  ? 'text-center font-bold text-ink'
                  : 'text-center text-xl font-bold text-ink'
              }
              style={referenceSize ? { fontSize: 22 } : undefined}
            >
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text
              className={
                referenceSize
                  ? 'mt-1 text-center text-muted'
                  : 'mt-1 text-center text-xs text-muted'
              }
              style={referenceSize ? { fontSize: 15 } : undefined}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
      {children}
    </SafeAreaView>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod/v3';

import { AsyncState } from '../design-system/AsyncState';
import { ColorPickerField } from '../design-system/ColorPickerField';
import { FormField } from '../design-system/FormField';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { ScreenFrame } from '../design-system/ScreenFrame';
import { useSaveTeam, useTeam } from '../features/teams/queries';
import { TeamFormIcon } from '../features/teams/TeamIcons';
import type { RootStackParamList } from '../navigation/types';
import type { TeamInput } from '../types/domain';

export const teamFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nome deve ter ao menos 3 caracteres.')
    .max(120),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Use uma cor no formato #RRGGBB.'),
});
type Values = z.infer<typeof teamFormSchema>;
type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeamForm'>;
type Route = RouteProp<RootStackParamList, 'TeamForm'>;
export const teamColorOptions = [
  '#B8F500',
  '#F3D400',
  '#00C7D9',
  '#00A67D',
  '#E64A55',
  '#8B7CF6',
] as const;

export function toTeamInput(values: Values): TeamInput {
  return {
    name: values.name.trim(),
    colorHex: values.colorHex.toUpperCase(),
  };
}

export function TeamFormScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const teamId = route.params?.teamId;
  const teamQuery = useTeam(teamId);
  const mutation = useSaveTeam(teamId);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: { name: '', colorHex: '#B8F500' },
  });

  useEffect(() => {
    if (teamQuery.data) {
      reset({
        name: teamQuery.data.name,
        colorHex: teamQuery.data.colorHex,
      });
    }
  }, [reset, teamQuery.data]);

  const submit = handleSubmit(values =>
    mutation.mutate(toTeamInput(values), {
      onSuccess: () => {
        Alert.alert(teamId ? 'Time atualizado' : 'Time criado');
        navigation.goBack();
      },
      onError: error => Alert.alert('Nao foi possivel salvar', error.message),
    }),
  );

  if (teamId && teamQuery.isLoading) {
    return (
      <ScreenFrame onBack={() => navigation.goBack()}>
        <AsyncState kind="loading" />
      </ScreenFrame>
    );
  }
  if (teamId && teamQuery.isError) {
    return (
      <ScreenFrame onBack={() => navigation.goBack()}>
        <AsyncState
          kind="error"
          message={teamQuery.error.message}
          onRetry={() => void teamQuery.refetch()}
        />
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame onBack={() => navigation.goBack()}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow px-5 pb-5"
        >
          <View className="items-center pb-7 pt-24">
            <TeamFormIcon color="#00B37E" size={56} testID="team-form-icon" />
            <Text
              className="font-bold text-ink"
              style={{ fontSize: 22, lineHeight: 28, marginTop: 10 }}
            >
              {teamId ? 'Editar time' : 'Novo Time'}
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
            name="name"
            render={({ field }) => (
              <FormField
                label="Nome do time"
                placeholder="Nome do time"
                showLabel={false}
                size="reference"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="colorHex"
            render={({ field }) => (
              <ColorPickerField
                label="Cor do time"
                value={field.value}
                options={teamColorOptions}
                onChange={field.onChange}
                error={errors.colorHex?.message}
                testID="team-color-picker"
              />
            )}
          />
          <PrimaryButton
            label={teamId ? 'Salvar' : 'Criar'}
            loading={mutation.isPending}
            onPress={() => void submit()}
            size="reference"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenFrame>
  );
}

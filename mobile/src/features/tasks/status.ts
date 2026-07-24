import type { TaskStatus } from '../../types/domain';

export const statusLabels: Record<TaskStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em progresso',
  COMPLETED: 'Concluida',
};

export const statusColors: Record<TaskStatus, string> = {
  PENDING: '#E64A55',
  IN_PROGRESS: '#E6A72F',
  COMPLETED: '#78B800',
};

export const statusOrder: TaskStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
];

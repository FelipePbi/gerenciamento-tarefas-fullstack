import { API_BASE_URL, API_TIMEOUT_MS } from '../config/env';
import type {
  Paginated,
  Task,
  TaskInput,
  TaskStatus,
  Team,
  TeamInput,
} from '../types/domain';

type ErrorEnvelope = {
  error?: { code?: string; message?: string; details?: unknown[] };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = 'UNKNOWN_ERROR',
    public readonly details: unknown[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = RequestInit & { signal?: AbortSignal };

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
    if (response.status === 204) return undefined as T;
    const body = (await response.json()) as T & ErrorEnvelope;
    if (!response.ok) {
      throw new ApiError(
        body.error?.message || `API respondeu HTTP ${response.status}.`,
        response.status,
        body.error?.code,
        body.error?.details,
      );
    }
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('A requisicao excedeu o tempo limite.', 0, 'TIMEOUT');
    }
    throw new ApiError('Nao foi possivel conectar a API.', 0, 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

function queryString(
  values: Record<string, string | number | undefined>,
): string {
  const entries = Object.entries(values).filter(
    (entry): entry is [string, string | number] =>
      entry[1] !== undefined && entry[1] !== '',
  );
  return entries.length
    ? `?${entries
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
        )
        .join('&')}`
    : '';
}

export const api = {
  listTeams: (
    params: { search?: string; limit: number; offset: number },
    signal?: AbortSignal,
  ) => request<Paginated<Team>>(`/api/teams${queryString(params)}`, { signal }),
  getTeam: async (id: string, signal?: AbortSignal) =>
    (await request<{ data: Team }>(`/api/teams/${id}`, { signal })).data,
  createTeam: async (input: TeamInput) =>
    (
      await request<{ data: Team }>('/api/teams', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    ).data,
  updateTeam: async (id: string, input: TeamInput) =>
    (
      await request<{ data: Team }>(`/api/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })
    ).data,
  deleteTeam: (id: string) =>
    request<void>(`/api/teams/${id}`, { method: 'DELETE' }),

  listTasks: (
    params: {
      teamId?: string;
      status?: TaskStatus;
      search?: string;
      sort?: string;
      limit: number;
      offset: number;
    },
    signal?: AbortSignal,
  ) => request<Paginated<Task>>(`/api/tasks${queryString(params)}`, { signal }),
  getTask: async (id: string, signal?: AbortSignal) =>
    (await request<{ data: Task }>(`/api/tasks/${id}`, { signal })).data,
  createTask: async (input: TaskInput) =>
    (
      await request<{ data: Task }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    ).data,
  updateTask: async (id: string, input: TaskInput) =>
    (
      await request<{ data: Task }>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })
    ).data,
  updateTaskStatus: async (id: string, status: TaskStatus) =>
    (
      await request<{ data: Task }>(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    ).data,
  deleteTask: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
};

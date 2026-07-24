export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type Team = {
  id: string;
  name: string;
  colorHex: string;
  createdAt: string;
  updatedAt: string;
  _count?: { taskTeams: number };
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  teams: Team[];
};

export type PageMeta = {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
};

export type Paginated<T> = { data: T[]; meta: PageMeta };

export type TeamInput = Pick<Team, 'name' | 'colorHex'>;

export type TaskInput = Pick<Task, 'title' | 'status'> & {
  description?: string | null;
  teamIds: string[];
};

import { api } from '../src/services/apiClient';

describe('api client', () => {
  afterEach(() => jest.restoreAllMocks());

  it('builds paginated team requests and parses the envelope', async () => {
    const payload = {
      data: [],
      meta: { total: 0, limit: 20, offset: 0, hasNext: false },
    };
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => payload });
    await expect(
      api.listTeams({ search: 'produto', limit: 20, offset: 0 }),
    ).resolves.toEqual(payload);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://test.local/api/teams?search=produto&limit=20&offset=0',
      expect.objectContaining({ signal: expect.anything() }),
    );
  });

  it('normalizes API errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        error: { code: 'VALIDATION_ERROR', message: 'Invalido', details: [] },
      }),
    });
    await expect(
      api.createTask({ title: 'x', status: 'PENDING', teamIds: [] }),
    ).rejects.toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Invalido',
    });
  });

  it('updates only task status through the PATCH endpoint', async () => {
    const task = { id: 'task-1', status: 'COMPLETED' };
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: task }),
    });

    await expect(api.updateTaskStatus('task-1', 'COMPLETED')).resolves.toEqual(
      task,
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://test.local/api/tasks/task-1/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED' }),
      }),
    );
  });
});

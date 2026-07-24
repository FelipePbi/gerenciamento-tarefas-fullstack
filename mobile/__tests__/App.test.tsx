/**
 * @format
 */

import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import App from '../App';
import { queryClient } from '../src/app/queryClient';

test('renders team list from the API', async () => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      data: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Produto',
          colorHex: '#B8F500',
          createdAt: '2026-07-22T12:00:00.000Z',
          updatedAt: '2026-07-22T12:00:00.000Z',
          _count: { taskTeams: 2 },
        },
      ],
      meta: { total: 1, limit: 20, offset: 0, hasNext: false },
    }),
  });
  const screen = render(<App />);
  await waitFor(() => expect(screen.getByText('Produto')).toBeTruthy());
  expect(screen.getByText('Times')).toBeTruthy();
  screen.unmount();
  queryClient.clear();
});

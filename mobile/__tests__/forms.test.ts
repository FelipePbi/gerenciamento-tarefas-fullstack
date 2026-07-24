import { taskFormSchema, toTaskInput } from '../src/screens/TaskFormScreen';
import { teamFormSchema, toTeamInput } from '../src/screens/TeamFormScreen';

describe('mobile form validation', () => {
  it('rejects a short trimmed task title', () => {
    expect(
      taskFormSchema.safeParse({
        title: ' x ',
        description: '',
        status: 'PENDING',
        teamIds: [],
      }).success,
    ).toBe(false);
  });

  it('requires an explicit task status', () => {
    expect(
      taskFormSchema.safeParse({
        title: 'Tarefa valida',
        description: '',
        teamIds: [],
      }).success,
    ).toBe(false);
  });

  it('accepts zero or many teams', () => {
    const base = {
      title: 'Tarefa valida',
      description: '',
      status: 'PENDING' as const,
    };
    expect(taskFormSchema.safeParse({ ...base, teamIds: [] }).success).toBe(
      true,
    );
    expect(
      taskFormSchema.safeParse({ ...base, teamIds: ['a', 'b'] }).success,
    ).toBe(true);
  });

  it('normalizes the task payload without obsolete fields', () => {
    expect(
      toTaskInput({
        title: '  Revisar interface  ',
        description: '  Comparar com o Figma.  ',
        status: 'IN_PROGRESS',
        teamIds: ['design', 'engineering'],
      }),
    ).toEqual({
      title: 'Revisar interface',
      description: 'Comparar com o Figma.',
      status: 'IN_PROGRESS',
      teamIds: ['design', 'engineering'],
    });
  });

  it('validates team hexadecimal color', () => {
    expect(
      teamFormSchema.safeParse({
        name: 'Produto',
        colorHex: '#00A67D',
      }).success,
    ).toBe(true);
    expect(
      teamFormSchema.safeParse({
        name: 'Produto',
        colorHex: 'verde',
      }).success,
    ).toBe(false);
  });

  it('normalizes the team payload without obsolete fields', () => {
    expect(
      toTeamInput({
        name: '  Produto  ',
        colorHex: '#00a67d',
      }),
    ).toEqual({
      name: 'Produto',
      colorHex: '#00A67D',
    });
  });
});

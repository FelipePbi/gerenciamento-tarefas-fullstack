import { render } from '@testing-library/react-native';
import { Path } from 'react-native-svg';

import { TeamFormIcon, TeamListIcon } from '../src/features/teams/TeamIcons';

describe('team SVG icons', () => {
  it('renders the list icon at the requested size and color', () => {
    const screen = render(
      <TeamListIcon color="#00C7D9" size={40} testID="list-icon" />,
    );

    const icon = screen.getByTestId('list-icon', {
      includeHiddenElements: true,
    });
    const paths = screen.UNSAFE_getAllByType(Path);

    expect(icon.props.width).toBe(40);
    expect(icon.props.height).toBe(40);
    expect(paths).toHaveLength(1);
    expect(paths[0]?.props.fill).toBe('#00C7D9');
  });

  it('preserves all six paths from the form SVG', () => {
    const screen = render(<TeamFormIcon color="#00B37E" testID="form-icon" />);

    const icon = screen.getByTestId('form-icon', {
      includeHiddenElements: true,
    });
    const paths = screen.UNSAFE_getAllByType(Path);

    expect(icon.props.width).toBe(56);
    expect(icon.props.height).toBe(56);
    expect(paths).toHaveLength(6);
    paths.forEach(path => expect(path.props.fill).toBe('#00B37E'));
  });
});

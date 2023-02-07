import * as React from 'react';
import Loader from './Loader';
import { render } from '@testing-library/react';

describe('Loader', () => {
  it('should render correctly', () => {
    const container = render(<Loader />);
    expect(container.baseElement).toMatchSnapshot();
  });
});

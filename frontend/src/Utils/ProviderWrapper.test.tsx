import * as React from 'react';
import { render } from '@testing-library/react';
import ProviderWrapper from './ProviderWrapper';

describe('ProviderWrapper', () => {
  test('should render correctly', () => {
    const useValueHook = jest.fn();
    useValueHook.mockReturnValueOnce(10);
    const container = render(
      <ProviderWrapper provider={React.createContext<unknown>({}).Provider} useValueHook={useValueHook}>
        foo
      </ProviderWrapper>,
    );
    expect(container.baseElement).toMatchSnapshot();
  });
  test('should pass correct value', () => {
    const useValueHook = jest.fn();
    render(
      <ProviderWrapper provider={React.createContext<unknown>({}).Provider} useValueHook={useValueHook}>
        foo
      </ProviderWrapper>,
    );
    expect(useValueHook).toBeCalledTimes(1);
  });
});

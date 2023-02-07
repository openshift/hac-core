import * as React from 'react';
import { render } from '@testing-library/react';
import ModelFeatureFlagLoader from './ModelFeatureFlagLoader';

let setFeatureFlag = jest.fn();

jest.mock('@openshift/dynamic-plugin-sdk', () => ({
  useFeatureFlag: () => [undefined, setFeatureFlag],
}));

jest.mock('@openshift/dynamic-plugin-sdk-utils', () => ({
  useK8sModel: ({ group }: { group: string }) => [group === 'foo' ? {} : undefined],
}));

describe('ModelFeatureFlagLoader', () => {
  test('should call feature flag once', () => {
    setFeatureFlag = jest.fn();
    render(
      <ModelFeatureFlagLoader
        flag="foo"
        model={{
          group: 'foo',
          version: 'bar',
          kind: 'baz',
        }}
      />,
    );
    expect(setFeatureFlag).toHaveBeenCalledTimes(1);
  });
  test('should enable feature flag', () => {
    setFeatureFlag = jest.fn();
    render(
      <ModelFeatureFlagLoader
        flag="foo"
        model={{
          group: 'foo',
          version: 'bar',
          kind: 'baz',
        }}
      />,
    );
    expect(setFeatureFlag).toHaveBeenCalledWith(true);
  });
  test('should disable feature flag', () => {
    setFeatureFlag = jest.fn();
    render(
      <ModelFeatureFlagLoader
        flag="foo"
        model={{
          group: 'foo2',
          version: 'bar',
          kind: 'baz',
        }}
      />,
    );
    expect(setFeatureFlag).toHaveBeenCalledWith(false);
  });
});

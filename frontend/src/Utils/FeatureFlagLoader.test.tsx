import * as React from 'react';
import { render } from '@testing-library/react';
import FeatureFlagLoader from './FeatureFlagLoader';
import type { SetFeatureFlag } from '@openshift/dynamic-plugin-sdk-extensions';

let setFeatureFlag = jest.fn();

jest.mock('@openshift/dynamic-plugin-sdk', () => ({
  usePluginStore: () => ({
    setFeatureFlags: setFeatureFlag,
  }),
}));

describe('FeatureFlagLoader', () => {
  test('should call handler once', () => {
    const handler = jest.fn();
    render(<FeatureFlagLoader handler={handler} />);
    expect(handler).toHaveBeenCalledTimes(1);
  });
  test('should call setFeatureFlag once', () => {
    const handler = (callback: SetFeatureFlag) => callback('foo', false);
    setFeatureFlag = jest.fn();
    render(<FeatureFlagLoader handler={handler} />);
    expect(setFeatureFlag).toHaveBeenCalledTimes(1);
  });
  test('should call setFeatureFlag with correct data', () => {
    const handler = (callback: SetFeatureFlag) => callback('foo', false);
    setFeatureFlag = jest.fn();
    render(<FeatureFlagLoader handler={handler} />);
    expect(setFeatureFlag).toHaveBeenCalledWith({ foo: false });
  });
});

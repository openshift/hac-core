import * as React from 'react';
import { usePluginStore } from '@openshift/dynamic-plugin-sdk';
import type { SetFeatureFlag } from '@openshift/dynamic-plugin-sdk-extensions';

export type ModelFeatureFlagLoaderProps = {
  handler: (callback: SetFeatureFlag) => void;
};
/**
 * Component to wrap handling of feature flag handler.
 * @param function function that accepts single argmunet of type SetFeatureFlag callback.
 * @returns null
 */
const FeatureFlagLoader: React.FC<ModelFeatureFlagLoaderProps> = ({ handler }) => {
  const pluginStore = usePluginStore();
  const setFlagCallback = React.useCallback(
    (name, value) => {
      pluginStore.setFeatureFlags({ [name]: value });
    },
    [pluginStore],
  );
  handler(setFlagCallback);

  return null;
};

export default React.memo(FeatureFlagLoader);

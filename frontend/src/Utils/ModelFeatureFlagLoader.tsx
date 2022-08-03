import * as React from 'react';
import { useFeatureFlag } from '@openshift/dynamic-plugin-sdk';
import { useK8sModel } from '@openshift/dynamic-plugin-sdk-utils';

export type ModelFeatureFlagLoaderProps = {
  flag: string;
  model: {
    group: string;
    version: string;
    kind: string;
  };
};

/**
 * Component to wrap setting and loading of model feature flag.
 * @param ModelFeatureFlagLoaderProps which model and feature flag to set for given namespace.
 * @returns null
 */
const ModelFeatureFlagLoader: React.FC<ModelFeatureFlagLoaderProps> = ({ flag, model }) => {
  const [, setFlag] = useFeatureFlag(flag);
  const [data] = useK8sModel(model);

  React.useEffect(() => {
    setFlag(!!data);
  }, [data, setFlag]);

  return null;
};

export default React.memo(ModelFeatureFlagLoader);

import * as React from 'react';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import Loader from '../Utils/Loader';
import useAppConfiguration from './useAppConfiguration';

const InitializeSDK: React.FC = ({ children }) => {
  const appConfigurations = useAppConfiguration();

  if (!appConfigurations) {
    return <Loader />;
  }

  // TODO(SDK): Don't override children
  // TODO(SDK): AppInitSDK doesn't work with no redux
  // react_devtools_backend.js:4061 Error: could not find react-redux context value; please ensure the component is wrapped in a <Provider>
  return <AppInitSDK configurations={appConfigurations}>{children as React.ReactElement}</AppInitSDK>;
};

export default InitializeSDK;

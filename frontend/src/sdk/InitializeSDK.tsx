import * as React from 'react';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import { LoadedPluginInfoEntry, PluginEventType, PluginInfoEntry } from '@openshift/dynamic-plugin-sdk';
import Loader from '../Utils/Loader';
import useAppConfiguration from './useAppConfiguration';

export const isLoadedPlugin = (e: PluginInfoEntry): e is LoadedPluginInfoEntry => Object.prototype.hasOwnProperty.call(e, 'metadata');

const InitializeSDK: React.FC = ({ children }) => {
  const appConfigurations = useAppConfiguration();
  const [apiWhiteList, setApiWhiteList] = React.useState<undefined | string[]>();
  const [loaded, setLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (appConfigurations?.pluginStore) {
      appConfigurations.pluginStore.subscribe([PluginEventType.PluginInfoChanged], () => {
        if (appConfigurations?.pluginStore.getPluginInfo().length !== 0) {
          const newApis = appConfigurations?.pluginStore.getPluginInfo().flatMap((info) => {
            if (isLoadedPlugin(info)) {
              return info.metadata.apiWhitelist;
            }
          }).filter(Boolean) || [];
          if (newApis?.length > 0){
            setApiWhiteList(Array.from(new Set(newApis)) as string[])
          }
        }
        setLoaded(true);
      });
    }
  }, [appConfigurations?.pluginStore])

  if (!loaded || !appConfigurations) {
    return <Loader />;
  }

  // TODO(SDK): Don't override children
  // TODO(SDK): AppInitSDK doesn't work with no redux
  // react_devtools_backend.js:4061 Error: could not find react-redux context value; please ensure the component is wrapped in a <Provider>
  return <AppInitSDK configurations={{
    ...appConfigurations,
    apiWhitelist: apiWhiteList
  }}>{children as any}</AppInitSDK>;
};

export default InitializeSDK;

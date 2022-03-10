import * as React from 'react';
import { commonFetch } from './commonFetch';
import { getWSTokenSubProtocols } from './wsConfigs';
import useAuthToken from './useAuthToken';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import { PluginLoader, PluginLoaderOptions, PluginStore } from '@openshift/dynamic-plugin-sdk';
import { getActivePlugins } from '../Utils/plugins';
import packageInfo from '../../package.json';

type AppConfigurations = React.ComponentProps<typeof AppInitSDK>['configurations'];

export const createStore = () => {
  const fetchImpl: PluginLoaderOptions['fetchImpl'] = (url, requestInit) => {
    return fetch(url, requestInit);
  };

  const pluginLoader = new PluginLoader({ fetchImpl });
  pluginLoader.registerPluginEntryCallback();
  const pluginStore = new PluginStore();
  pluginStore.setLoader(pluginLoader);
  getActivePlugins(true, packageInfo.insights.appname).then((data) => {
    data.forEach(({ name: item, pathPrefix = '/api/plugins' }) => {
      const url = `/beta${pathPrefix}/${item}/`;
      pluginStore.loadPlugin(url);
    });
  });
  return pluginStore;
};
const pluginStore = createStore();

const useAppConfiguration = (): AppConfigurations | null => {
  const [appConfigurations, setAppConfigurations] = React.useState<AppConfigurations | null>(null);
  const token = useAuthToken();

  React.useEffect(() => {
    if (token && !appConfigurations) {
      setAppConfigurations({
        appFetch: commonFetch(token),
        apiDiscovery: () => {},
        wsAppSettings: {
          host: K8S_WS_TARGET_URL,
          subProtocols: getWSTokenSubProtocols(token),
          // TODO: check for `?` and use '&'
          urlAugment: (url) => `${url}?watch=true`,
        },
        pluginStore,
      });
    }
  }, [appConfigurations, pluginStore, token]);

  return appConfigurations;
};

export default useAppConfiguration;

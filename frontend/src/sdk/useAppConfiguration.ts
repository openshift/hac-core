import * as React from 'react';
import { commonFetch } from './commonFetch';
import { getWSTokenSubProtocols } from './wsConfigs';
import useAuthToken from './useAuthToken';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import usePluginStore from './usePluginStore';

type AppConfigurations = React.ComponentProps<typeof AppInitSDK>['configurations'];

const useAppConfiguration = (): AppConfigurations | null => {
  const [appConfigurations, setAppConfigurations] = React.useState<AppConfigurations | null>(null);
  const token = useAuthToken();
  const pluginStore = usePluginStore();

  React.useEffect(() => {
    if (token && pluginStore && !appConfigurations) {
      setAppConfigurations({
        appFetch: commonFetch(token),
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

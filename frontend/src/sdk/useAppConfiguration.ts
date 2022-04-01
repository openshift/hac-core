import * as React from 'react';
import { commonFetch } from './commonFetch';
import { getWSTokenSubProtocols } from './wsConfigs';
import useAuthToken from './useAuthToken';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import { pluginStore } from 'Sdk/createStore';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

type AppConfigurations = React.ComponentProps<typeof AppInitSDK>['configurations'];

const useAppConfiguration = (): AppConfigurations | null => {
  const { auth } = useChrome();
  const [appConfigurations, setAppConfigurations] = React.useState<AppConfigurations | null>(null);
  const token = useAuthToken();

  React.useEffect(() => {
    if (auth && token && !appConfigurations) {
      setAppConfigurations({
        appFetch: commonFetch(auth),
        wsAppSettings: {
          host: K8S_WS_TARGET_URL,
          subProtocols: getWSTokenSubProtocols(token),
          // TODO: check for `?` and use '&'
          urlAugment: (url) => `${url}?watch=true`,
        },
        pluginStore,
      });
    }
  }, [appConfigurations, pluginStore, token, auth]);

  return appConfigurations;
};

export default useAppConfiguration;

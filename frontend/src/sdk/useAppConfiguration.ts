import * as React from 'react';
import { commonFetch } from './commonFetch';
import { getWSTokenSubProtocols } from './wsConfigs';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import { pluginStore } from 'Sdk/createStore';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

type AppConfigurations = React.ComponentProps<typeof AppInitSDK>['configurations'];

const useAppConfiguration = (): AppConfigurations | null => {
  const { auth } = useChrome();
  const [appConfigurations, setAppConfigurations] = React.useState<AppConfigurations | null>(null);

  React.useEffect(() => {
    if (auth && !appConfigurations) {
      setAppConfigurations({
        appFetch: commonFetch(auth),
        wsAppSettings: async () => {
          const token = await auth.getToken();
          return {
            host: K8S_WS_TARGET_URL,
            subProtocols: getWSTokenSubProtocols(token),
            // TODO: check for `?` and use '&'
            urlAugment: (url) => `${url}?watch=true`,
          };
        },
        apiPriorityList: ['appstudio.redhat.com'],
        pluginStore,
      });
    }
  }, [appConfigurations, pluginStore, auth]);

  return appConfigurations;
};

export default useAppConfiguration;

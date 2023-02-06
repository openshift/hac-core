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
        wsAppSettings: async (options: { wsPrefix?: string; pathPrefix?: string }) => {
          const prefix = (options?.wsPrefix || options?.pathPrefix || '') as string;
          const token = await auth.getToken();
          const host =
            localStorage.getItem('hac/proxy-ws') !== null
              ? `wss://${location.host}${prefix || '/wss/k8s'}`
              : `wss://api-toolchain-host-operator.apps.appstudio-stage.x99m.p1.openshiftapps.com:443${prefix}`;
          return {
            host,
            subProtocols: getWSTokenSubProtocols(token),
            urlAugment: (url: string) => {
              const [origUrl, query] = url.split('?') || [];
              const queryParams = new URLSearchParams(query);
              if (!queryParams.get('watch')) {
                queryParams.set('watch', 'true');
              }
              return `${origUrl}?${queryParams.toString()}`;
            },
          };
        },
        apiPriorityList: ['appstudio.redhat.com'],
        pluginStore,
      });
    }
  }, [appConfigurations, auth]);

  return appConfigurations;
};

export default useAppConfiguration;

import * as React from 'react';
import { commonFetch } from './commonFetch';
import { getWSTokenSubProtocols } from './wsConfigs';
import { createStore } from './createStore';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import { useScalprum } from '@scalprum/react-core';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

type AppConfigurations = React.ComponentProps<typeof AppInitSDK>['configurations'];

const useAppConfiguration = (): AppConfigurations | null => {
  const { auth } = useChrome();
  const [appConfigurations, setAppConfigurations] = React.useState<AppConfigurations | null>(null);

  const { pluginStore } = useScalprum();

  React.useEffect(() => {
    if (auth && !appConfigurations) {
      createStore(pluginStore);
      setAppConfigurations({
        appFetch: commonFetch(auth),
        wsAppSettings: async (options: { wsPrefix?: string; pathPrefix?: string }) => {
          const prefix = (options?.wsPrefix || options?.pathPrefix || '/wss/k8s') as string;
          const token = await auth.getToken();
          return {
            host: `wss://${location.host}${prefix.indexOf('/') === 0 ? '' : '/'}${prefix}`,
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
  }, [appConfigurations, auth, pluginStore]);

  return appConfigurations;
};

export default useAppConfiguration;

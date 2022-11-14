import * as React from 'react';
import { commonFetch } from './commonFetch';
import { getWSTokenSubProtocols } from './wsConfigs';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import { pluginStore } from './createStore';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { WorkspaceProvider } from '../Utils/WorkspaceProvider';

type AppConfigurations = React.ComponentProps<typeof AppInitSDK>['configurations'];

const useAppConfiguration = (): AppConfigurations | null => {
  const { auth } = useChrome();
  const [appConfigurations, setAppConfigurations] = React.useState<AppConfigurations | null>(null);
  const { activeWorkspace } = React.useContext(WorkspaceProvider);

  React.useEffect(() => {
    if (auth && !appConfigurations) {
      setAppConfigurations({
        appFetch: commonFetch(auth, activeWorkspace),
        wsAppSettings: async (options: { wsPrefix?: string; pathPrefix?: string }) => {
          const pathFallback = activeWorkspace ? `/wss/kcp/${activeWorkspace}` : '/wss/k8s';
          const prefix = (options?.wsPrefix || options?.pathPrefix || pathFallback) as string;
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
  }, [appConfigurations, auth, activeWorkspace]);

  return appConfigurations;
};

export default useAppConfiguration;

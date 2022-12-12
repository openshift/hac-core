import * as React from 'react';
import { commonFetch } from './commonFetch';
import { getWSTokenSubProtocols } from './wsConfigs';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import { pluginStore } from 'Sdk/createStore';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { core, apps, configOs, appsOs } from './staticModels';

type AppConfigurations = React.ComponentProps<typeof AppInitSDK>['configurations'];

const useAppConfiguration = (): AppConfigurations | null => {
  const { auth } = useChrome();
  const [appConfigurations, setAppConfigurations] = React.useState<AppConfigurations | null>(null);
  React.useEffect(() => {
    if (auth && !appConfigurations) {
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
        staticAPIModels: {
          '/api/v1': core,
          '/apis/apps/v1': apps,
          '/apis/config.openshift.io/v1': configOs,
          '/apis/apps.openshift.io/v1': appsOs,
        },
        pluginStore,
      });
    }
  }, [appConfigurations, auth]);

  return appConfigurations;
};

export default useAppConfiguration;

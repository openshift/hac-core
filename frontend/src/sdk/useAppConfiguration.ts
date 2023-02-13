import * as React from 'react';
import { commonFetch } from './commonFetch';
import { getWSTokenSubProtocols } from './wsConfigs';
import { createStore } from './createStore';
import { AppInitSDK } from '@openshift/dynamic-plugin-sdk-utils';
import { useScalprum } from '@scalprum/react-core';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

type AppConfigurations = React.ComponentProps<typeof AppInitSDK>['configurations'];

// TODO: remove once RHCLOUD-24173 is fixed and return just `wss://${location.host}${prefix || '/wss/k8s'}`
const getWsURL = ({ wsPrefix, pathPrefix }: { wsPrefix?: string; pathPrefix?: string } = {}) => {
  const prefix = (wsPrefix || pathPrefix || '') as string;
  if (localStorage.getItem('hac/proxy-ws') !== null) {
    return `wss://${location.host}${prefix || '/wss/k8s'}`;
  }

  if (location.origin.includes('console.dev.redhat.com')) {
    return `wss://api-toolchain-host-operator.apps.stone-stg-host1.hjvn.p1.openshiftapps.com${prefix}`;
  }

  return `wss://api-toolchain-host-operator.apps.appstudio-stage.x99m.p1.openshiftapps.com:443${prefix}`;
};

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
          const token = await auth.getToken();
          return {
            host: getWsURL(options),
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

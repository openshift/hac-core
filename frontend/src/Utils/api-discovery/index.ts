import { createAPIActions, DiscoveryResources, InitAPIDiscovery, K8sState } from '@openshift/dynamic-plugin-sdk-utils';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { cacheResources, getCachedResources } from './cache';
import { API_DISCOVERY_INIT_DELAY } from './consts';
import { batchResourcesRequest, getResources } from './getResources';

export const startAPIDiscovery = async (preferenceList: string[], dispatch: ThunkDispatch<{ k8s: K8sState }, undefined, AnyAction>) => {
  try {
    const actions = createAPIActions(dispatch);
    actions.setResourcesInFlight(true);
    actions.setBatchesInFlight(true);
    const [batches, groupVersionMap] = await getResources(preferenceList);
    for (const batch of batches) {
      const resources = await Promise.all(batchResourcesRequest(batch as string[]));
      cacheResources(resources as DiscoveryResources[]);
      resources.map((resource: DiscoveryResources) => actions.receivedResources({ ...resource, ...groupVersionMap }));
    }
    actions.setBatchesInFlight(false);
    actions.setResourcesInFlight(false);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('API discovery startAPIDiscovery failed:', e);
  }
};

export const initAPIDiscovery: InitAPIDiscovery = (storeInstance, preferenceList = []) => {
  const resources = getCachedResources();
  if (resources) {
    createAPIActions(storeInstance.dispatch).receivedResources(resources);
  }

  // eslint-disable-next-line no-console
  console.info(`API discovery waiting ${API_DISCOVERY_INIT_DELAY} ms before initializing`);
  window.setTimeout(() => startAPIDiscovery(preferenceList, storeInstance.dispatch), API_DISCOVERY_INIT_DELAY);
};

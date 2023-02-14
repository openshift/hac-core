import type { DiscoveryResources, K8sModelCommon } from '@openshift/dynamic-plugin-sdk-utils';
import mergeWith from 'lodash/mergeWith';
import { SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY } from './consts';
import { mergeByKey } from './utils';

export const getLocalResources = () => {
  try {
    return JSON.parse(localStorage.getItem(SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY) || '{}');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Cannot load cached API resources', e);
    throw e;
  }
};

export const setLocalResources = (resources: DiscoveryResources[]) => {
  try {
    localStorage.setItem(SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY, JSON.stringify(resources));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error caching API resources in localStorage', e);
    throw e;
  }
};

export const getCachedResources = () => {
  const resourcesJSON = localStorage.getItem(SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY);
  if (!resourcesJSON) {
    // eslint-disable-next-line no-console
    console.error(`No API resources found in localStorage for key ${SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY}`);
    return null;
  }

  // Clear cached resources after load as a safeguard. If there's any errors
  // with the content that prevents the console from working, the bad data
  // will not be loaded when the user refreshes the console. The cache will
  // be refreshed when discovery completes.
  localStorage.removeItem(SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY);

  const resources = JSON.parse(resourcesJSON);
  // eslint-disable-next-line no-console
  console.info('Loaded cached API resources from localStorage');
  return resources;
};

export const cacheResources = (resources: DiscoveryResources[]) => {
  const allResources = [...[getLocalResources()], ...resources].reduce(
    (acc, curr) =>
      mergeWith(acc, curr, (first: K8sModelCommon[], second: K8sModelCommon[]) => {
        if (Array.isArray(first) && first[0]?.constructor?.name === 'Object') {
          return mergeByKey(first, second);
        }

        return undefined;
      }),
    {},
  );
  setLocalResources(allResources);
};

import { DiscoveryResources } from '../Utils/api-discovery.types';

export const receivedResources = (resources: DiscoveryResources) => ({
  type: 'resources',
  payload: { resources },
});

export const setResourcesInFlight = (isInFlight: boolean) => ({
  type: 'setResourcesInFlight',
  payload: { isInFlight },
});

export const setBatchesInFlight = (isInFlight: boolean) => ({
  type: 'setBatchesInFlight',
  payload: { isInFlight },
});

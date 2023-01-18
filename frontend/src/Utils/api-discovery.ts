import { commonFetchJSON, K8sGroupVersionKind, K8sModelCommon } from '@openshift/dynamic-plugin-sdk-utils';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import mergeWith from 'lodash/mergeWith';
import merge from 'lodash/merge';
import keyBy from 'lodash/keyBy';
import chunk from 'lodash/chunk';
import startCase from 'lodash/startCase';
import { plural } from 'pluralize';
import { receivedResources, setResourcesInFlight, setBatchesInFlight } from '../store/actions';
import {
  AnyObject,
  APIResourceData,
  APIResourceList,
  DiscoveryResources,
  GroupVersion,
  InitAPIDiscovery,
  K8sResourceKindReference,
  SDKStoreState,
} from './api-discovery.types';

const API_DISCOVERY_INIT_DELAY = 5_000;
const API_DISCOVERY_REQUEST_BATCH_SIZE = 5;
const SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY = 'sdk/api-discovery-resources';
const abbrBlacklist = ['ASS'];

export const kindToAbbr = (kind: string) => {
  const abbrKind = (kind.replace(/[^A-Z]/g, '') || kind.toUpperCase()).slice(0, 4);
  return abbrBlacklist.includes(abbrKind) ? abbrKind.slice(0, -1) : abbrKind;
};

const pluralizeKind = (kind: string): string => {
  // Use startCase to separate words so the last can be pluralized but remove spaces so as not to humanize
  const pluralized = plural(startCase(kind)).replace(/\s+/g, '');
  // Handle special cases like DB -> DBs (instead of DBS).
  if (pluralized === `${kind}S`) {
    return `${kind}s`;
  }
  return pluralized;
};

const getCachedResources = () => {
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

const getLocalResources = () => {
  try {
    return JSON.parse(localStorage.getItem(SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY) || '{}');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Cannot load cached API resources', e);
    throw e;
  }
};

export const getReference = ({ group, version, kind }: K8sGroupVersionKind): K8sResourceKindReference => [group || 'core', version, kind].join('~');

export const getReferenceForModel = (model: K8sModelCommon): K8sResourceKindReference =>
  getReference({ group: model.apiGroup, version: model.apiVersion, kind: model.kind });

const mergeByKey = (prev: K8sModelCommon[], next: K8sModelCommon[]) =>
  Object.values(merge(keyBy(prev, getReferenceForModel), keyBy(next, getReferenceForModel)));

const setLocalResources = (resources: DiscoveryResources[]) => {
  try {
    localStorage.setItem(SDK_API_DISCOVERY_RESOURCES_LOCAL_STORAGE_KEY, JSON.stringify(resources));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error caching API resources in localStorage', e);
    throw e;
  }
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

const defineModels = (list: APIResourceList): K8sModelCommon[] => {
  const { groupVersion } = list;
  const [apiVersion, apiGroup] = groupVersion.split('/').reverse();
  if (!list.resources || list.resources.length < 1) {
    return [];
  }
  return list.resources
    .filter(({ name }) => !name.includes('/'))
    .map(
      ({ name, singularName, namespaced, kind, verbs, shortNames }) =>
        <K8sModelCommon>{
          ...(apiGroup ? { apiGroup } : {}),
          apiVersion,
          kind,
          namespaced,
          verbs,
          shortNames,
          plural: name,
          crd: true,
          abbr: kindToAbbr(kind),
          labelPlural: pluralizeKind(kind),
          path: name,
          id: singularName,
          label: kind,
        },
    );
};

const batchResourcesRequest = (batch: string[]): Promise<DiscoveryResources>[] => {
  return batch.map<Promise<DiscoveryResources>>(async (p: string) => {
    const resourceList = await commonFetchJSON<APIResourceList>(p);
    const resourceSet = new Set<string>();
    const namespacedSet = new Set<string>();
    resourceList.resources?.forEach(({ namespaced, name }) => {
      resourceSet.add(name);
      if (namespaced) {
        namespacedSet.add(name);
      }
    });
    const allResources = [...resourceSet].sort();

    const safeResources: string[] = [];
    const adminResources: string[] = [];
    const models = defineModels(resourceList).flat();
    const coreResources = new Set(['roles', 'rolebindings', 'clusterroles', 'clusterrolebindings', 'thirdpartyresources', 'nodes', 'secrets']);
    allResources.forEach((r) => (coreResources.has(r.split('/')[0]) ? adminResources.push(r) : safeResources.push(r)));
    const configResources = models.filter((m) => m.apiGroup === 'config.openshift.io' && m.kind !== 'ClusterOperator');
    const clusterOperatorConfigResources = models.filter((m) => m.apiGroup === 'operator.openshift.io');

    return {
      allResources,
      safeResources,
      adminResources,
      configResources,
      clusterOperatorConfigResources,
      namespacedSet,
      models,
    } as DiscoveryResources;
  });
};

const getResources = async (preferenceList: string[]): Promise<[(string | string[])[][], GroupVersion]> => {
  const apiResourceData: APIResourceData = await commonFetchJSON('/apis');
  const groupVersionMap = apiResourceData.groups.reduce((acc: AnyObject, { name, versions, preferredVersion: { version } }) => {
    acc[name] = {
      versions: versions.map(({ version: oneVersion }) => oneVersion),
      preferredVersion: version,
    };
    return acc;
  }, {});
  const all = [
    '/api/v1',
    ...apiResourceData.groups
      .flatMap<string[]>((group) => group.versions.map<string>((version) => `/apis/${version.groupVersion}`))
      .sort((api) => (preferenceList.find((item) => api.includes(`/apis/${item}`)) ? -1 : 0)),
  ];
  return [chunk(all, API_DISCOVERY_REQUEST_BATCH_SIZE), groupVersionMap as GroupVersion];
};

const startAPIDiscovery = async (preferenceList: string[], dispatch: ThunkDispatch<SDKStoreState, undefined, AnyAction>) => {
  try {
    dispatch(setResourcesInFlight(true));
    dispatch(setBatchesInFlight(true));
    const [batches, groupVersionMap] = await getResources(preferenceList);
    for (const batch of batches) {
      const resources = await Promise.all(batchResourcesRequest(batch as string[]));
      cacheResources(resources as DiscoveryResources[]);
      resources.map((resource: DiscoveryResources) => dispatch(receivedResources({ ...resource, ...groupVersionMap })));
    }
    dispatch(setBatchesInFlight(false));
    dispatch(setResourcesInFlight(false));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('API discovery startAPIDiscovery failed:', e);
  }
};

export const initAPIDiscovery: InitAPIDiscovery = (storeInstance, preferenceList = []) => {
  const resources = getCachedResources();
  if (resources) {
    storeInstance.dispatch(receivedResources(resources));
  }

  // eslint-disable-next-line no-console
  console.info(`API discovery waiting ${API_DISCOVERY_INIT_DELAY} ms before initializing`);
  window.setTimeout(() => {
    startAPIDiscovery(preferenceList, storeInstance.dispatch);
  }, API_DISCOVERY_INIT_DELAY);
};

import { AnyObject } from '@openshift/dynamic-plugin-sdk';
import { commonFetchJSON, DiscoveryResources, K8sModelCommon } from '@openshift/dynamic-plugin-sdk-utils';
import chunk from 'lodash/chunk';
import { API_DISCOVERY_REQUEST_BATCH_SIZE, coreResources } from './consts';
import { kindToAbbr, pluralizeKind } from './utils';
import type { APIResourceData, APIResourceList, GroupVersion } from '../api-discovery.types';
import staticAPIModels from './staticModels';

export const defineModels = (list: APIResourceList): K8sModelCommon[] => {
  const { groupVersion = '' } = list;
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

export const batchResourcesRequest = (batch: string[]): Promise<DiscoveryResources>[] => {
  return batch.map<Promise<DiscoveryResources>>(async (p: string) => {
    const [, staticresourceList] = Object.entries(staticAPIModels).find(([key]) => key === p) || [];
    const resourceList = staticresourceList || (await commonFetchJSON<APIResourceList>(p));
    const resourceSet = new Set<string>();
    const namespacedSet = new Set<string>();
    (resourceList || {}).resources?.forEach(({ namespaced, name }) => {
      resourceSet.add(name);
      if (namespaced) {
        namespacedSet.add(name);
      }
    });
    const allResources = [...resourceSet].sort();

    const safeResources: string[] = [];
    const adminResources: string[] = [];
    const models = defineModels(resourceList || {}).flat();
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

export const getResources = async (preferenceList: string[]): Promise<[(string | string[])[][], GroupVersion]> => {
  const apiResourceData: APIResourceData = await commonFetchJSON('/apis');
  const groupVersionMap = (apiResourceData?.groups || []).reduce((acc: AnyObject, { name, versions, preferredVersion: { version } }) => {
    acc[name] = {
      versions: versions.map(({ version: oneVersion }) => oneVersion),
      preferredVersion: version,
    };
    return acc;
  }, {});
  const all = [
    '/api/v1',
    ...(apiResourceData?.groups || [])
      .flatMap<string[]>((group) => group.versions.map<string>((version) => `/apis/${version.groupVersion}`))
      .sort((api) => (preferenceList.find((item) => api.includes(`/apis/${item}`)) ? -1 : 0)),
  ];
  return [chunk(all, API_DISCOVERY_REQUEST_BATCH_SIZE), groupVersionMap as GroupVersion];
};

import { APIResourceList } from 'src/Utils/api-discovery.types';

const model: APIResourceList = {
  plural: '',
  kind: 'APIResourceList' as const,
  apiVersion: 'v1',
  groupVersion: 'apps.openshift.io/v1',
  resources: [
    {
      name: 'deploymentconfigs',
      singularName: '',
      namespaced: true,
      kind: 'DeploymentConfig',
      verbs: ['create', 'delete', 'deletecollection', 'get', 'list', 'patch', 'update', 'watch'],
      shortNames: ['dc'],
      categories: ['all'],
      storageVersionHash: '6xyoXGsxfiA=',
    },
    {
      name: 'deploymentconfigs/instantiate',
      singularName: '',
      namespaced: true,
      kind: 'DeploymentRequest',
      verbs: ['create'],
    },
    {
      name: 'deploymentconfigs/log',
      singularName: '',
      namespaced: true,
      kind: 'DeploymentLog',
      verbs: ['get'],
    },
    {
      name: 'deploymentconfigs/rollback',
      singularName: '',
      namespaced: true,
      kind: 'DeploymentConfigRollback',
      verbs: ['create'],
    },
    {
      name: 'deploymentconfigs/scale',
      singularName: '',
      namespaced: true,
      group: 'extensions',
      version: 'v1beta1',
      kind: 'Scale',
      verbs: ['get', 'patch', 'update'],
    },
    {
      name: 'deploymentconfigs/status',
      singularName: '',
      namespaced: true,
      kind: 'DeploymentConfig',
      verbs: ['get', 'patch', 'update'],
    },
  ],
};

export default model;

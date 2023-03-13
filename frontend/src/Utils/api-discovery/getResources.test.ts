const common = { commonFetchJSON: jest.fn() };
const utils = {
  kindToAbbr: jest.fn().mockReturnValue('ABR'),
  pluralizeKind: jest.fn().mockReturnValue('ABRs'),
};

import { APIResourceData, APIResourceList } from '../api-discovery.types';
import { defineModels, getResources, batchResourcesRequest } from './getResources';
import staticCore from './__mocks__/staticCore';

jest.mock('@openshift/dynamic-plugin-sdk-utils', () => common);
jest.mock('./utils', () => utils);

describe('getResources', () => {
  const data: APIResourceData = {
    groups: [
      {
        name: 'bar',
        versions: [
          {
            groupVersion: 'baz-1',
            version: '1',
          },
        ],
        preferredVersion: { version: '1' },
      },
      {
        name: 'foo',
        versions: [
          {
            groupVersion: 'foo-1',
            version: '1',
          },
        ],
        preferredVersion: { version: '1' },
      },
    ],
  };
  const groupVersion = { foo: { preferredVersion: '1', versions: ['1'] }, bar: { preferredVersion: '1', versions: ['1'] } };

  test('should call common fetch', async () => {
    const value = await getResources([]);
    expect(common.commonFetchJSON).toHaveBeenCalled();
    expect(value).toStrictEqual([[['/api/v1']], {}]);
  });
  test('should include new group', async () => {
    common.commonFetchJSON.mockReturnValueOnce(data);
    const value = await getResources([]);
    expect(value).toStrictEqual([[['/api/v1', '/apis/baz-1', '/apis/foo-1']], groupVersion]);
  });
  test('should order based on preference list', async () => {
    common.commonFetchJSON.mockReturnValueOnce(data);
    const value = await getResources(['foo-1']);
    expect(value).toStrictEqual([[['/api/v1', '/apis/foo-1', '/apis/baz-1']], groupVersion]);
  });
});

describe('defineModels', () => {
  const apiResouceList: APIResourceList = {
    kind: 'APIResourceList',
    apiVersion: 'v1',
    groupVersion: 'foo/bar',
    plural: 'Foo',
    resources: [
      {
        name: 'foo',
        kind: 'bar',
        verbs: ['get'],
      },
    ],
  };
  const model = {
    apiGroup: 'foo',
    apiVersion: 'bar',
    kind: 'bar',
    namespaced: undefined,
    verbs: ['get'],
    shortNames: undefined,
    plural: 'foo',
    crd: true,
    abbr: 'ABR',
    labelPlural: 'ABRs',
    path: 'foo',
    id: undefined,
    label: 'bar',
  };
  test('should define model', () => {
    const result = defineModels(apiResouceList);
    expect(result).toStrictEqual([model]);
  });
  test('empty resources', () => {
    const currResourceList = { ...apiResouceList };
    delete currResourceList.resources;
    const result = defineModels(currResourceList);
    expect(result).toStrictEqual([]);
  });
  test('groupVersion without `/`', () => {
    const result = defineModels({
      ...apiResouceList,
      groupVersion: 'foo',
    });
    expect(result).toStrictEqual([
      {
        apiVersion: 'foo',
        kind: 'bar',
        namespaced: undefined,
        verbs: ['get'],
        shortNames: undefined,
        plural: 'foo',
        crd: true,
        abbr: 'ABR',
        labelPlural: 'ABRs',
        path: 'foo',
        id: undefined,
        label: 'bar',
      },
    ]);
  });
  test('filter out models with `/` in name', () => {
    const result = defineModels({
      ...apiResouceList,
      resources: [
        {
          name: 'foo/bar',
          kind: 'bar',
          verbs: ['get'],
        },
      ],
    });
    expect(result).toStrictEqual([]);
  });
});

describe('batchResourcesRequest', () => {
  const data: APIResourceList = {
    kind: 'APIResourceList',
    apiVersion: 'v1',
    groupVersion: 'foo/bar',
    plural: 'Foo',
    resources: [
      {
        name: 'foo',
        kind: 'bar',
        verbs: ['get'],
      },
    ],
  };
  const model = {
    apiGroup: 'foo',
    apiVersion: 'bar',
    kind: 'bar',
    namespaced: undefined,
    verbs: ['get'],
    shortNames: undefined,
    plural: 'foo',
    crd: true,
    abbr: 'ABR',
    labelPlural: 'ABRs',
    path: 'foo',
    id: undefined,
    label: 'bar',
  };
  test('should calculate resources', async () => {
    common.commonFetchJSON.mockReturnValueOnce(data);
    const result = await Promise.all(batchResourcesRequest(['/foo']));
    expect(result).toStrictEqual([
      {
        allResources: ['foo'],
        safeResources: ['foo'],
        adminResources: [],
        configResources: [],
        clusterOperatorConfigResources: [],
        namespacedSet: new Set(),
        models: [model],
      },
    ]);
  });
  test('should gracefully handle empty resources', async () => {
    const currData = { ...data };
    delete currData.resources;
    common.commonFetchJSON.mockReturnValueOnce(currData);
    const result = await Promise.all(batchResourcesRequest(['/foo']));
    expect(result).toStrictEqual([
      {
        allResources: [],
        safeResources: [],
        adminResources: [],
        configResources: [],
        clusterOperatorConfigResources: [],
        namespacedSet: new Set(),
        models: [],
      },
    ]);
  });
  test('should calculate admin resources', async () => {
    const currData = { ...data };
    currData.resources = [
      {
        name: 'roles/foo',
        kind: '',
        verbs: ['get'],
      },
      {
        name: 'foo',
        kind: 'bar',
        verbs: ['get'],
      },
    ];
    common.commonFetchJSON.mockReturnValueOnce(currData);
    const result = await Promise.all(batchResourcesRequest(['/foo']));
    expect(result).toStrictEqual([
      {
        allResources: ['foo', 'roles/foo'],
        safeResources: ['foo'],
        adminResources: ['roles/foo'],
        configResources: [],
        clusterOperatorConfigResources: [],
        namespacedSet: new Set(),
        models: [model],
      },
    ]);
  });
  test('should add to namespaced', async () => {
    const currData = { ...data };
    currData.resources = [
      {
        namespaced: true,
        name: 'foo',
        kind: 'bar',
        verbs: ['get'],
      },
    ];
    common.commonFetchJSON.mockReturnValueOnce(currData);
    const result = await Promise.all(batchResourcesRequest(['/foo']));
    expect(result).toStrictEqual([
      {
        allResources: ['foo'],
        safeResources: ['foo'],
        adminResources: [],
        configResources: [],
        clusterOperatorConfigResources: [],
        namespacedSet: new Set(['foo']),
        models: [
          {
            ...model,
            namespaced: true,
          },
        ],
      },
    ]);
  });
  test('no resource list returned', async () => {
    common.commonFetchJSON.mockReturnValueOnce(undefined);
    const result = await Promise.all(batchResourcesRequest(['/foo']));
    expect(result).toStrictEqual([
      {
        allResources: [],
        safeResources: [],
        adminResources: [],
        configResources: [],
        clusterOperatorConfigResources: [],
        namespacedSet: new Set(),
        models: [],
      },
    ]);
  });
  test('should calculate config resources', async () => {
    const currData = { ...data };
    const currModel = { ...model };
    currData.groupVersion = 'config.openshift.io/bar';
    currModel.apiGroup = 'config.openshift.io';
    common.commonFetchJSON.mockReturnValueOnce(currData);
    const result = await Promise.all(batchResourcesRequest(['/foo']));
    expect(result).toStrictEqual([
      {
        allResources: ['foo'],
        safeResources: ['foo'],
        adminResources: [],
        configResources: [currModel],
        clusterOperatorConfigResources: [],
        namespacedSet: new Set(),
        models: [currModel],
      },
    ]);
  });
  test('should calculate cluster operator resources', async () => {
    const currData = { ...data };
    const currModel = { ...model };
    currData.groupVersion = 'operator.openshift.io/bar';
    currModel.apiGroup = 'operator.openshift.io';
    common.commonFetchJSON.mockReturnValueOnce(currData);
    const result = await Promise.all(batchResourcesRequest(['/foo']));
    expect(result).toStrictEqual([
      {
        allResources: ['foo'],
        safeResources: ['foo'],
        adminResources: [],
        configResources: [],
        clusterOperatorConfigResources: [currModel],
        namespacedSet: new Set(),
        models: [currModel],
      },
    ]);
  });

  test('should not call commonFetch for static model', async () => {
    const result = await Promise.all(batchResourcesRequest(['/api/v1']));
    expect(common.commonFetchJSON).not.toHaveBeenCalled();
    expect(result).toStrictEqual(staticCore);
  });
});

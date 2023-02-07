import { DiscoveryResources } from '@openshift/dynamic-plugin-sdk-utils';
import { getLocalResources, setLocalResources } from './cache';

const setItem = jest.fn();
const getItem = jest.fn();

Storage.prototype.setItem = setItem;
Storage.prototype.getItem = getItem;

describe('getLocalResources', () => {
  test('should not fail if no resources set', () => {
    getLocalResources();
    expect(localStorage.getItem).toBeCalledTimes(1);
  });
  test('should call getItem with correct key', () => {
    getLocalResources();
    expect(localStorage.getItem).toBeCalledWith('sdk/api-discovery-resources');
  });
  test('should return previously set values', () => {
    getItem.mockReturnValueOnce('{"foo": "bar"}');
    const resources = getLocalResources();
    expect(resources).toStrictEqual({ foo: 'bar' });
  });
  test('should throw an error', () => {});
});

describe('setLocalResources', () => {
  test('should call setItem once', () => {
    setLocalResources([]);
    expect(localStorage.setItem).toBeCalledTimes(1);
  });
  test('should call setItem with correct key', () => {
    setLocalResources([]);
    expect(localStorage.setItem).toBeCalledWith('sdk/api-discovery-resources', '[]');
  });
  test('should call setItem with correct data', () => {
    const data: DiscoveryResources = {
      adminResources: [''],
      allResources: [''],
      configResources: [{ plural: '', apiVersion: '', kind: '' }],
      clusterOperatorConfigResources: [{ plural: '', apiVersion: '', kind: '' }],
      models: [{ plural: '', apiVersion: '', kind: '' }],
      namespacedSet: new Set(),
      safeResources: [''],
      groupVersionMap: { foo: { versions: [''], preferredVersion: '' } },
    };
    setLocalResources([data]);
    expect(localStorage.setItem).toBeCalledWith('sdk/api-discovery-resources', JSON.stringify([data]));
  });
});

describe('cacheResources', () => {});

describe('getCachedResources', () => {});

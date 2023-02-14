const cache = {
  cacheResources: jest.fn(),
  getCachedResources: jest.fn(),
};

const resources = {
  batchResourcesRequest: jest.fn(),
  getResources: jest.fn().mockReturnValue(Promise.resolve([[]])),
};

const apiActions = {
  setResourcesInFlight: jest.fn(),
  setBatchesInFlight: jest.fn(),
  receivedResources: jest.fn(),
};

import { initAPIDiscovery, startAPIDiscovery } from './index';

const mockedStore = {
  dispatch: jest.fn(),
  getState: jest.fn(),
  subscribe: jest.fn(),
  replaceReducer: jest.fn(),
  [Symbol.observable]: jest.fn(),
};
jest.mock('./cache', () => cache);
jest.mock('./getResources', () => resources);

jest.mock('@openshift/dynamic-plugin-sdk-utils', () => ({
  createAPIActions: () => apiActions,
}));

jest.useFakeTimers();

describe('initAPIDiscovery', () => {
  test('should call get cached resources and dispatch them', () => {
    apiActions.receivedResources = jest.fn();
    cache.getCachedResources = jest.fn();
    initAPIDiscovery(mockedStore, []);
    expect(cache.getCachedResources).toHaveBeenCalledTimes(1);
  });

  test('should dispatch cached resources', () => {
    apiActions.receivedResources = jest.fn();
    cache.getCachedResources = jest.fn();
    cache.getCachedResources.mockReturnValueOnce([{ foo: 'bar' }]);
    initAPIDiscovery(mockedStore, []);
    expect(apiActions.receivedResources).toHaveBeenCalledTimes(1);
    expect(apiActions.receivedResources).toHaveBeenLastCalledWith([{ foo: 'bar' }]);
  });

  test('should start api discovery after some time', async () => {
    initAPIDiscovery(mockedStore, []);
    jest.runAllTimers();
    expect(apiActions.setResourcesInFlight).toHaveBeenCalled();
    expect(apiActions.setBatchesInFlight).toHaveBeenCalled();
  });
});

describe('startAPIDiscovery', () => {
  test('should call batchResources', async () => {
    resources.getResources.mockReturnValueOnce(Promise.resolve([[['/api']]]));
    resources.batchResourcesRequest.mockReturnValueOnce([Promise.resolve()]);
    await startAPIDiscovery([], jest.fn());
    expect(resources.batchResourcesRequest).toHaveBeenCalled();
  });

  test('should call cacheResources', async () => {
    resources.getResources.mockReturnValueOnce(Promise.resolve([[['/api']]]));
    resources.batchResourcesRequest.mockReturnValueOnce([Promise.resolve()]);
    await startAPIDiscovery([], jest.fn());
    expect(cache.cacheResources).toHaveBeenCalled();
  });

  test('should call cacheResources', async () => {
    resources.getResources.mockReturnValueOnce(Promise.resolve([[['/api']], { foo: 'bar' }]));
    resources.batchResourcesRequest.mockReturnValueOnce([Promise.resolve({ bar: 'baz' })]);
    await startAPIDiscovery([], jest.fn());
    expect(apiActions.receivedResources).toHaveBeenCalledWith({ bar: 'baz', foo: 'bar' });
  });
});

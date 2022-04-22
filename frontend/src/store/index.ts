import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsMiddleware } from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import { SDKReducers } from '@openshift/dynamic-plugin-sdk-utils';
import thunk from 'redux-thunk';

let registry;

export function init(...middleware) {
  registry = getRegistry(
    {},
    [thunk, promiseMiddleware, notificationsMiddleware({ errorDescriptionKey: ['detail', 'stack'] }), ...middleware.filter(Boolean)],
    undefined,
  );
  registry.register(SDKReducers);
  return registry;
}

export function getStore() {
  return registry.getStore();
}

export function register(...args) {
  return registry.register(...args);
}

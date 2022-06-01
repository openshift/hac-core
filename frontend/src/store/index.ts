import { createContext } from 'react';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsMiddleware } from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import { SDKReducers } from '@openshift/dynamic-plugin-sdk-utils';
import thunk from 'redux-thunk';
import type { Store } from 'redux';

export type Registry = {
  getStore: () => Store;
  register<TRegister>(toRegister: TRegister): void;
};

export type ContextRegistry = {
  getRegistry: () => Registry;
};

export const RegistryContext = createContext<ContextRegistry>(undefined);

let registry: Registry;

export function init(...middleware): Registry {
  registry = getRegistry(
    {},
    [thunk, promiseMiddleware, notificationsMiddleware({ errorDescriptionKey: ['detail', 'stack'] }), ...middleware.filter(Boolean)],
    undefined,
  );
  registry.register(SDKReducers);
  return registry;
}

import { createContext } from 'react';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { ReducerRegistry } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsMiddleware } from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import { SDKReducers } from '@openshift/dynamic-plugin-sdk-utils';
import thunk from 'redux-thunk';
import type { Middleware, Store } from 'redux';

export type Registry = {
  getStore: () => Store;
  register<TRegister>(toRegister: TRegister): void;
};

export type ContextRegistry = {
  getRegistry: () => ReducerRegistry<any>;
};

export const RegistryContext = createContext<ContextRegistry>({} as ContextRegistry);

let registry: ReducerRegistry<any>;

export function init(...middleware: Middleware[]): ReducerRegistry<any> {
  registry = getRegistry(
    {},
    [thunk, promiseMiddleware, notificationsMiddleware({ errorDescriptionKey: ['detail', 'stack'] }), ...middleware.filter(Boolean)],
    undefined,
  );
  registry.register(SDKReducers as any);
  return registry;
}

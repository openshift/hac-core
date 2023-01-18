import { K8sModelCommon } from '@openshift/dynamic-plugin-sdk-utils';
import { Action, Store } from 'redux';

// eslint-disable-next-line no-shadow
export declare enum ActionType {
  ReceivedResources = 'resources',
  SetResourcesInFlight = 'setResourcesInFlight',
  SetBatchesInFlight = 'setBatchesInFlight',
  StartWatchK8sObject = 'startWatchK8sObject',
  StartWatchK8sList = 'startWatchK8sList',
  ModifyObject = 'modifyObject',
  StopWatchK8s = 'stopWatchK8s',

  Errored = 'errored',
  Loaded = 'loaded',
  BulkAddToList = 'bulkAddToList',
  UpdateListFromWS = 'updateListFromWS',
  FilterList = 'filterList',
}

export type K8sResourceKindReference = string;

export type InitAPIDiscovery = (store: Store<unknown, Action<string>>, preferenceList?: string[]) => void;

export type DiscoveryResources = {
  adminResources: string[];
  allResources: string[];
  configResources: K8sModelCommon[];
  clusterOperatorConfigResources: K8sModelCommon[];
  models: K8sModelCommon[];
  namespacedSet: Set<string>;
  safeResources: string[];
  groupVersionMap: {
    [key: string]: {
      versions: string[];
      preferredVersion: string;
    };
  };
};

export type K8sVerb = 'create' | 'get' | 'list' | 'update' | 'patch' | 'delete' | 'deletecollection' | 'watch';

export type GroupVersion = {
  [key: string]: {
    versions: string[];
    preferredVersion: string;
  };
};

export type AnyObject = Record<string, unknown>;

export type APIResourceData = {
  groups: {
    name: string;
    versions: {
      groupVersion: unknown;
      version: string;
    }[];
    preferredVersion: { version: unknown };
  }[];
};

export type APIResourceList = K8sModelCommon & {
  kind: 'APIResourceList';
  apiVersion: 'v1';
  groupVersion: string;
  resources?: {
    name: string;
    singularName?: string;
    namespaced?: boolean;
    kind: string;
    verbs: K8sVerb[];
    shortNames?: string[];
  }[];
};

export type SDKStoreState = {
  k8s: any;
};

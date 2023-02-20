import { K8sModelCommon, K8sVerb } from '@openshift/dynamic-plugin-sdk-utils';

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
    categories?: string[];
    storageVersionHash?: string;
    group?: string;
    version?: string;
  }[];
};

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

export type GroupVersion = {
  [key: string]: {
    versions: string[];
    preferredVersion: string;
  };
};

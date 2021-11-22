/* eslint-disable */
import {
  ConsoleFetch,
  ConsoleFetchJSON,
  ConsoleFetchText,
  UseResolvedExtensions,
  UseActivePerspective,
} from '../extensions/console-types';
import { K8sGet, K8sCreate, K8sUpdate, K8sPatch, K8sDelete, K8sList } from './k8s-types';

export const useResolvedExtensions: UseResolvedExtensions = require('@console/dynamic-plugin-sdk/src/api/useResolvedExtensions')
  .useResolvedExtensions;
export const consoleFetch: ConsoleFetch = require('@console/dynamic-plugin-sdk/src/utils/fetch')
  .consoleFetch;
export const consoleFetchJSON: ConsoleFetchJSON = require('@console/dynamic-plugin-sdk/src/utils/fetch')
  .consoleFetchJSON;
export const consoleFetchText: ConsoleFetchText = require('@console/dynamic-plugin-sdk/src/utils/fetch')
  .consoleFetchText;

export const useActivePerspective: UseActivePerspective = require('@console/dynamic-plugin-sdk/src/perspective/useActivePerspective')
  .default;

// Expose K8s CRUD utilities as below
export const k8sGet: K8sGet = require('@console/dynamic-plugin-sdk/src/utils/k8s').k8sGetResource;
export const k8sCreate: K8sCreate = require('@console/dynamic-plugin-sdk/src/utils/k8s')
  .k8sCreateResource;
export const k8sUpdate: K8sUpdate = require('@console/dynamic-plugin-sdk/src/utils/k8s')
  .k8sUpdateResource;
export const k8sPatch: K8sPatch = require('@console/dynamic-plugin-sdk/src/utils/k8s')
  .k8sPatchResource;
export const k8sDelete: K8sDelete = require('@console/dynamic-plugin-sdk/src/utils/k8s')
  .k8sDeleteResource;
export const k8sList: K8sList = require('@console/dynamic-plugin-sdk/src/utils/k8s')
  .k8sListResource;
export {
  getAPIVersionForModel,
  getGroupVersionKindForResource,
  getGroupVersionKindForModel,
} from '@console/dynamic-plugin-sdk/src/utils/k8s/k8s-ref';

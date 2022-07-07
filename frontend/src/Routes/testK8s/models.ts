import { K8sModelCommon } from '@openshift/dynamic-plugin-sdk-utils';

export const ApplicationModel: K8sModelCommon = {
  apiVersion: 'v1alpha1',
  kind: 'Application',
  apiGroup: 'appstudio.redhat.com',
  plural: 'applications',
};

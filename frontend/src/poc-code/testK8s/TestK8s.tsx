/* eslint-disable no-console */
import * as React from 'react';
import { Button, PageSection, TextInput } from '@patternfly/react-core';
import {
  k8sCreateResource,
  k8sDeleteResource,
  k8sGetResource,
  k8sListResource,
  // K8sModel,
  k8sPatchResource,
  // K8sResourceCommon,
  k8sUpdateResource,
} from '@openshift/dynamic-plugin-sdk-utils';

import type { K8sModel, K8sResourceCommon } from './dynamic-plugin-sdk';

const ProjectModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'project.openshift.io',
  kind: 'Project',
  abbr: 'PR',
  label: 'Project',
  labelPlural: 'Projects',
  plural: 'projects',
};

const ApplicationModel: K8sModel = {
  apiVersion: 'v1alpha1',
  kind: 'Application',
  apiGroup: 'appstudio.redhat.com',
  abbr: 'A',
  label: 'Application',
  labelPlural: 'Applications',
  plural: 'applications',
};

// eslint-disable-next-line no-shadow
enum ActionType {
  LIST = 'list projects',
  CREATE = 'create',
  GET = 'get',
  PATCH = 'patch',
  PUT = 'put',
  DELETE = 'delete',
}

const TestK8s: React.FC = () => {
  const [r, setR] = React.useState(null);
  const [namespace, setNamespace] = React.useState<string>('default');
  const [name, setName] = React.useState<string>('test');
  const [status, setStatus] = React.useState<string>('');
  const [action, setAction] = React.useState<ActionType | null>(null);
  const [resourceVersion, setResourceVersion] = React.useState<string>(null);

  React.useEffect(() => {
    const testApplicationMetadata = {
      name,
      ns: namespace,
    };
    const testApplicationData: K8sResourceCommon & { [key: string]: any } = {
      apiVersion: `${ApplicationModel.apiGroup}/${ApplicationModel.apiVersion}`,
      kind: ApplicationModel.kind,
      metadata: {
        name,
        namespace,
      },
    };

    let promise = null;
    switch (action) {
      case ActionType.LIST:
        promise = k8sListResource({
          model: ProjectModel,
        }).then(({ items }: any) => {
          let ns = null;
          if (Array.isArray(items)) {
            const namespaces = items.map((dataResource) => dataResource.metadata.name);
            console.debug('++++available namespaces:', namespaces);
            ns = namespaces[0];
          } else if (items?.metadata?.namespace) {
            ns = items.metadata.namespace;
          }

          if (ns) {
            setAction(null); // prevent re-invoking this effect/call
            setNamespace(ns);
          } else {
            // eslint-disable-next-line no-alert
            alert('Could not find namespace; you are likely not able to do much as we are targeting "default"');
          }
          return items;
        });
        break;
      case ActionType.CREATE:
        promise = k8sCreateResource({
          model: ApplicationModel,
          queryOptions: testApplicationMetadata,
          resource: testApplicationData,
        });
        break;
      case ActionType.GET:
        promise = k8sGetResource({
          model: ApplicationModel,
          queryOptions: testApplicationMetadata,
        }).then((data) => {
          setResourceVersion(data?.metadata?.resourceVersion);
          return data;
        });
        break;
      case ActionType.PATCH:
        promise = k8sPatchResource({
          model: ApplicationModel,
          queryOptions: testApplicationMetadata,
          patches: [
            {
              op: 'replace',
              path: '/test',
              value: 'false',
            },
          ],
        });
        break;
      case ActionType.PUT:
        promise = k8sUpdateResource({
          model: ApplicationModel,
          queryOptions: testApplicationMetadata,
          resource: {
            ...testApplicationData,
            metadata: {
              ...testApplicationData.metadata,
              resourceVersion,
            },
          },
        }).then((data) => {
          setResourceVersion(data?.metadata?.resourceVersion);
          return data;
        });
        break;
      case ActionType.DELETE:
        promise = k8sDeleteResource({
          model: ApplicationModel,
          queryOptions: testApplicationMetadata,
        });
        break;
      case null:
        // ignore effect
        break;
      default:
        // this shouldn't happen, catch state for missed cases
        throw new Error('uh oh!');
    }
    promise
      ?.then((data) => {
        setStatus(`${action} response:`);
        setR(data);
        console.debug(`++++${action}!`, data);
      })
      .catch((err) => {
        console.error(`++++failed ${action}`, err);
        setStatus(`failed call: ${err.message}`);
        setR(null);
      })
      .finally(() => {
        setAction(null); // prevent the hook for re-firing on name change
      });
  }, [action, name, namespace]);

  const sanitize = (resourceOrResourceList) => {
    if (Array.isArray(resourceOrResourceList)) {
      return resourceOrResourceList.map(sanitize);
    }

    const {
      apiVersion,
      kind,
      apiGroup,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      metadata: { managedFields, ...metadata }, // drop managedFields
      ...resource
    } = resourceOrResourceList;

    return {
      apiVersion,
      kind,
      apiGroup,
      metadata,
      ...resource,
    };
  };

  return (
    <PageSection>
      <TextInput placeholder="Application name" onChange={(v) => setName(v)} value={name} />
      <div>
        <p>Test calls -- predefined data; use the above input to make/update/get multiple Applications</p>
        {Object.values(ActionType).map((v) => (
          <React.Fragment key={v}>
            <Button
              isDisabled={(v !== ActionType.LIST && namespace === 'default') || (v === ActionType.PUT && resourceVersion === null)}
              onClick={() => setAction(v)}
            >
              {v}
            </Button>{' '}
          </React.Fragment>
        ))}
        In `{namespace}` namespace
      </div>
      <div>{status}</div>
      {r && <pre>{JSON.stringify(sanitize(r), null, 2)}</pre>}
    </PageSection>
  );
};

export default TestK8s;

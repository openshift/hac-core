/* eslint-disable no-console */
import * as React from 'react';
import { Button, PageSection, TextInput } from '@patternfly/react-core';
import {
  k8sCreateResource,
  k8sDeleteResource,
  k8sGetResource,
  k8sListResource,
  K8sModel,
  k8sPatchResource,
  K8sResourceCommon,
  k8sUpdateResource,
  // useK8sWatchResource,
} from './dynamic-plugin-sdk';
import WSTest from './WSTest';

const ProjectModel: K8sModel = {
  apiVersion: 'v1',
  apiGroup: 'project.openshift.io',
  kind: 'Project',
  abbr: 'PR',
  label: 'Project',
  labelPlural: 'Projects',
  plural: 'projects',
};
// const ConfigMapModel: K8sModel = {
//   apiVersion: 'v1',
//   kind: 'ConfigMap',
//   abbr: 'CM',
//   plural: 'configmaps',
//   labelPlural: 'ConfigMaps',
//   label: 'ConfigMap',
//   namespaced: true,
// };

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

  // const result = useK8sWatchResource({
  //   groupVersionKind: { version: 'v1', kind: 'ConfigMap' },
  //   name: 'test',
  //   namespace,
  // });
  // const result = useK8sWatchResource(
  //   namespace === 'default' // default namespace has 100s of configmaps, don't fetch it
  //     ? {}
  //     : {
  //         // groupVersionKind: { group: 'project.openshift.io', version: 'v1', kind: 'Project' },
  //         groupVersionKind: { version: 'v1', kind: 'ConfigMap' },
  //         isList: true,
  //         namespace,
  //       },
  // );
  // const hookResource = result[0];
  // console.debug('render result', result);

  React.useEffect(() => {
    const testApplicationMetadata = {
      metadata: {
        name,
        namespace,
      },
    };
    const testApplicationData: K8sResourceCommon & { [key: string]: any } = {
      apiVersion: `${ApplicationModel.apiGroup}/${ApplicationModel.apiVersion}`,
      kind: ApplicationModel.kind,
      ...testApplicationMetadata,
      spec: {
        displayName: name,
      },
    };

    let promise = null;
    switch (action) {
      case ActionType.LIST:
        // TODO: this can work sorta for getting your namespace value
        // response[0].metadata.name === your namespace
        promise = k8sListResource({
          model: ProjectModel,
        }).then((data) => {
          // Lock in the namespace
          let ns = null;
          if (Array.isArray(data)) {
            const namespaces = data.map((dataResource) => dataResource.metadata.name);
            console.debug('++++available namespaces:', namespaces);
            ns = namespaces[0];
          } else if (data?.metadata?.namespace) {
            ns = data.metadata.namespace;
          }

          if (ns) {
            setAction(null); // prevent re-invoking this effect/call
            setNamespace(ns);
          } else {
            // eslint-disable-next-line no-alert
            alert('Could not find namespace; you are likely not able to do much as we are targeting "default"');
          }
          return data;
        });
        break;
      case ActionType.CREATE:
        promise = k8sCreateResource({
          model: ApplicationModel,
          data: testApplicationData,
        });
        break;
      case ActionType.GET:
        promise = k8sGetResource({
          model: ApplicationModel,
          name: testApplicationMetadata.metadata.name,
          ns: testApplicationMetadata.metadata.namespace,
        });
        break;
      case ActionType.PATCH:
        promise = k8sPatchResource({
          model: ApplicationModel,
          resource: testApplicationMetadata,
          data: [
            {
              op: 'replace',
              path: '/data/test',
              value: 'false',
            },
          ],
        });
        break;
      case ActionType.PUT:
        promise = k8sUpdateResource({
          model: ApplicationModel,
          name: testApplicationMetadata.metadata.name,
          ns: testApplicationMetadata.metadata.namespace,
          data: { ...testApplicationData, data: { ...testApplicationData.data, new: 'prop' } },
        });
        break;
      case ActionType.DELETE:
        promise = k8sDeleteResource({
          model: ApplicationModel,
          resource: testApplicationMetadata,
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
      <WSTest />
      <TextInput placeholder="Application name" onChange={(v) => setName(v)} value={name} />
      <div>
        <p>Test calls -- predefined data; use the above input to make/update/get multiple Applications</p>
        {Object.values(ActionType).map((v) => (
          <React.Fragment key={v}>
            <Button isDisabled={v !== ActionType.LIST && namespace === 'default'} onClick={() => setAction(v)}>
              {v}
            </Button>{' '}
          </React.Fragment>
        ))}
        In `{namespace}` namespace
      </div>
      {/*{hookResource ? (*/}
      {/*  <>*/}
      {/*    {Array.isArray(hookResource) && <p>{hookResource.length} item(s) in the array</p>}*/}
      {/*    <pre>{JSON.stringify(hookResource, null, 2)}</pre>*/}
      {/*  </>*/}
      {/*) : (*/}
      {/*  'No watched resource'*/}
      {/*)}*/}
      <div>{status}</div>
      {r && <pre>{JSON.stringify(sanitize(r), null, 2)}</pre>}
    </PageSection>
  );
};

export default TestK8s;

/* eslint-disable no-console */
import * as React from 'react';
import { Title, TextInput } from '@patternfly/react-core';
import { useK8sWatchResource } from '@openshift/dynamic-plugin-sdk-utils';

/* This component is currently used to verify the useK8sWatchResource hook. */

type HookTestProps = {
  namespace: string;
};

const HookTest: React.FC<HookTestProps> = ({ namespace }) => {
  const [name, setName] = React.useState<string>('test');

  const watchedResource = {
    isList: false,
    groupVersionKind: {
      group: 'appstudio.redhat.com',
      version: 'v1alpha1',
      kind: 'Application',
    },
    name,
    namespace,
  };

  // TODO: The following code can be uncommented when we are ready to test the useK8sWatchResources hook
  // const watchedResources = {
  //   application: {
  //     isList: false,
  //     groupVersionKind: {
  //       group: 'appstudio.redhat.com',
  //       version: 'v1alpha1',
  //       kind: 'Application',
  //     },
  //     name: 'test',
  //     namespace,
  //   }
  // };

  const [data, loaded, error] = useK8sWatchResource(watchedResource);
  const isResourceLoaded = loaded || !!error;
  if (isResourceLoaded) {
    console.log('data from useK8sWatchResource: ', data);
  }

  // TODO: The following code can be uncommented when we are ready to test the useK8sWatchResources hook
  // const resources = useK8sWatchResources(watchedResources);
  // const areResourcesLoaded =
  //   Object.keys(resources).length > 0 &&
  //   Object.values(resources).every((value) => value.loaded || !!value.loadError);
  // const { data: resourceData } = resources.application;
  // if (areResourcesLoaded) {
  //   console.log("data from useK8sWatchResources: ", resourceData);
  // }

  return (
    <>
      <Title headingLevel="h2" size="xl">
        Test hooks to watch Application
      </Title>
      <TextInput placeholder="Application name" onChange={(v) => setName(v)} value={name} />
      <div>
        <p>Test useK8sWatchResource (watch Application: {name})</p>
        {!isResourceLoaded && <p>Loading resource...</p>}
        {isResourceLoaded && data && <p>Resource loaded</p>}
        {isResourceLoaded && !data && <p>No data -- did you create the Application?</p>}
      </div>
      {/* <div> TODO: This can be uncommented when we are ready to test the useK8sWatchResource hook
        <p>Test useK8sWatchResources (watch Application)</p>
        {!areResourcesLoaded && <p>Loading resource...</p>}
        {areResourcesLoaded && <p>Resource loaded</p>}
      </div> */}
    </>
  );
};

export default HookTest;

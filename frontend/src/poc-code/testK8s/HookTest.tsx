/* eslint-disable no-console */
import * as React from 'react';
import { Title, TextInput, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { useK8sWatchResource, useK8sWatchResources } from '@openshift/dynamic-plugin-sdk-utils';

/* This component is currently used to verify the useK8sWatchResource hook. */

type HookTestProps = {
  namespace: string;
};

const HookTest: React.FC<HookTestProps> = ({ namespace }) => {
  const [name, setName] = React.useState<string>('test');

  // Resource to test the useK8sWatchResource hook
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

  // Resource to test the useK8sWatchResources hook
  const watchedResources = {
    application: {
      isList: false,
      groupVersionKind: {
        group: 'appstudio.redhat.com',
        version: 'v1alpha1',
        kind: 'Application',
      },
      name,
      namespace,
    },
  };

  const [data, loaded, error] = useK8sWatchResource(watchedResource);
  const isResourceLoaded = loaded || !!error;
  if (isResourceLoaded) {
    console.log('data from useK8sWatchResource: ', data);
  }

  const { application } = useK8sWatchResources(watchedResources);
  const isAppResourceLoaded = application.loaded || !!application.loadError;
  const { data: appResourceData } = application;
  if (isAppResourceLoaded) {
    console.log('data from useK8sWatchResources: ', appResourceData);
  }

  return (
    <>
      <Title headingLevel="h2" size="xl">
        Test hooks to watch Application
      </Title>
      <TextInput placeholder="Application name" onChange={(v) => setName(v)} value={name} />
      <TextContent>
        <Text component={TextVariants.h4}>useK8sWatchResource (watch Application: {name})</Text>
        {!isResourceLoaded && <Text component={TextVariants.p}>Loading resource...</Text>}
        {isResourceLoaded && data && <Text component={TextVariants.p}>Resource loaded</Text>}
        {isResourceLoaded && !data && <Text component={TextVariants.p}>No data -- did you create the Application?</Text>}
      </TextContent>
      <br />
      <TextContent>
        <Text component={TextVariants.h4}>useK8sWatchResources (watch Application: {name})</Text>
        {!isAppResourceLoaded && <Text component={TextVariants.p}>Loading resource...</Text>}
        {isAppResourceLoaded && appResourceData && <Text component={TextVariants.p}>Resource loaded</Text>}
        {isAppResourceLoaded && !appResourceData && <Text component={TextVariants.p}>No data -- did you create the Application?</Text>}
      </TextContent>
    </>
  );
};

export default HookTest;

import * as React from 'react';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useStore } from 'react-redux';
import { RegistryContext } from './store';
import { useExtensions, useResolvedExtensions } from '@openshift/dynamic-plugin-sdk';
import { isFeatureFlag, isModelFeatureFlag } from '@openshift/dynamic-plugin-sdk-extensions';

const DynamicRoute = React.lazy(() => import(/* webpackChunkName: "DynamicRoute" */ './Routes/DynamicRoute/DynamicRoute'));

import FeatureFlagLoader from './Utils/FeatureFlagLoader';
import ModelFeatureFlagLoader from './Utils/ModelFeatureFlagLoader';

const App: React.FC = () => {
  const { getRegistry } = React.useContext(RegistryContext);
  const [featureExtension] = useResolvedExtensions(isFeatureFlag);
  const extensions = useExtensions(isModelFeatureFlag);

  const store = useStore();

  React.useEffect(() => {
    getRegistry().register({ notifications: notificationsReducer });
  }, [getRegistry]);

  return (
    <React.Fragment>
      {featureExtension.map((extension) => (
        <FeatureFlagLoader {...extension.properties} key={extension.uid} />
      ))}
      {extensions.map((extension) => (
        <ModelFeatureFlagLoader {...extension.properties} key={extension.uid} />
      ))}
      <NotificationsPortal store={store} />
      <React.Suspense
        fallback={
          <Bullseye>
            <Spinner />
          </Bullseye>
        }
      >
        <DynamicRoute />
      </React.Suspense>
    </React.Fragment>
  );
};

export default App;

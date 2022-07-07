import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from './Routes';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useStore } from 'react-redux';
import { RegistryContext } from './store';
import { isFeatureFlag, isModelFeatureFlag, useExtensions, useResolvedExtensions } from '@openshift/dynamic-plugin-sdk';
import FeatureFlagLoader from './Utils/FeatureFlagLoader';
import ModelFeatureFlagLoader from './Utils/ModelFeatureFlagLoader';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { getRegistry } = React.useContext(RegistryContext);
  const [featureExtension] = useResolvedExtensions(isFeatureFlag);
  const extensions = useExtensions(isModelFeatureFlag);

  const chrome = useChrome();
  const store = useStore();

  React.useEffect(() => {
    getRegistry().register({ notifications: notificationsReducer });
    const { on: onChromeEvent } = chrome?.init();

    const unregister = onChromeEvent('APP_NAVIGATION', (event) => {
      if (event.domEvent) {
        navigate(`${event.domEvent.href.replace('/hac', '')}`);
      }
    });
    return () => {
      unregister();
    };
  }, [history, chrome]);

  return (
    <React.Fragment>
      {featureExtension.map((extension) => (
        <FeatureFlagLoader {...extension.properties} key={extension.uid} />
      ))}
      {extensions.map((extension) => (
        <ModelFeatureFlagLoader {...extension.properties} key={extension.uid} />
      ))}
      <NotificationsPortal store={store} />
      <Routes />
    </React.Fragment>
  );
};

export default App;

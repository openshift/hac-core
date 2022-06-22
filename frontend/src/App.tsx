import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from './Routes';
import './App.scss';

import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useStore } from 'react-redux';
import { RegistryContext } from './store';

const App: React.FC = () => {
  const navigate = useNavigate();
  const { getRegistry } = React.useContext(RegistryContext);

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
      <NotificationsPortal store={store} />
      <Routes />
    </React.Fragment>
  );
};

export default App;

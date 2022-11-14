import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init, RegistryContext } from './store';
import { WorkspaceProvider } from './Utils/WorkspaceProvider'
import App from './App';
import logger from 'redux-logger';
import { InitializeSDK } from './sdk';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';

const AppEntry = () => {
  const registry = process.env.NODE_ENV !== 'production' ? init(logger) : init();
  const [activeWorkspace, setActiveWorkspace] = React.useState<string | null>(null);

  return (
    <RegistryContext.Provider
      value={{
        getRegistry: () => registry,
      }}
    >
      <Provider store={registry.getStore()}>
        <WorkspaceProvider.Provider value={{
          setActiveWorkspace: (workspace: string) => {
            setActiveWorkspace((activeWorkspace) => activeWorkspace !== workspace ? workspace : activeWorkspace);
          },
          activeWorkspace
        }}>
          <InitializeSDK>
            <Router basename={getBaseName(window.location.pathname, 0)}>
              <App />
            </Router>
          </InitializeSDK>
        </WorkspaceProvider.Provider>
      </Provider>
    </RegistryContext.Provider>
  );
};

export default AppEntry;

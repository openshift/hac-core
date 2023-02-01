import * as React from 'react';
import { Provider } from 'react-redux';
import { init, RegistryContext } from './store';
import App from './App';
import logger from 'redux-logger';
import { InitializeSDK } from './sdk';

const AppEntry = () => {
  const registry = process.env.NODE_ENV !== 'production' ? init(logger) : init();
  return (
    <RegistryContext.Provider
      value={{
        getRegistry: () => registry,
      }}
    >
      <Provider store={registry.getStore()}>
        <InitializeSDK>
          <App />
        </InitializeSDK>
      </Provider>
    </RegistryContext.Provider>
  );
};

export default AppEntry;

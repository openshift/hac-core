import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import logger from 'redux-logger';
import { InitializeSDK } from './sdk';

const AppEntry = () => {
  return (
    <Provider store={init(process.env.NODE_ENV !== 'production' && logger).getStore()}>
      <InitializeSDK>
        {() => {
          return (
            <Router basename={getBaseName(window.location.pathname, 1)}>
              <App />
            </Router>
          );
        }}
      </InitializeSDK>
    </Provider>
  );
};

export default AppEntry;

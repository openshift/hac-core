import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import logger from 'redux-logger';
import { IncludePlugins } from '@console/mount/src/components/plugins';
// import MainAppContent from '@console/mount/src/components/foundation/MainAppContent';
import { activePlugins } from './Utils/constants';

window.SERVER_FLAGS = {
  consolePlugins: activePlugins,
};

const AppEntry = () => (
  <Provider
    store={init(
      process.env.NODE_ENV !== 'production' ? logger : []
    ).getStore()}
  >
    <Router basename={getBaseName(window.location.pathname, 1)}>
      <IncludePlugins enabledPlugins={activePlugins} />
      <App />
    </Router>
  </Provider>
)

export default AppEntry;

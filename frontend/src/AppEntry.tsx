import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import logger from 'redux-logger';
import { IncludePlugins } from '@console/mount/src/components/plugins';
import { getActivePlugins, PluginType } from './Utils/plugins';
import Loader from './Utils/Loader';
import packageInfo from '../package.json';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const AppEntry = () => {
  const { isBeta } = useChrome();
  const [plugins, setPlugins] = React.useState<PluginType[]>([]);
  React.useEffect(() => {
    if (isBeta !== undefined) {
      getActivePlugins(isBeta(), packageInfo.insights.appname).then((data) => {
        setPlugins(data);
        window.SERVER_FLAGS = {
          consolePlugins: data.map(({ name }) => name),
        };
      });
    }
  }, [isBeta]);
  return (
    <Provider store={init(process.env.NODE_ENV !== 'production' && logger).getStore()}>
      <Router basename={getBaseName(window.location.pathname, 1)}>
        {plugins.length > 0 ? (
          <React.Fragment>
            <IncludePlugins enabledPlugins={plugins} base={isBeta?.() ? '/beta' : ''} />
            <App />
          </React.Fragment>
        ) : (
          <Loader />
        )}
      </Router>
    </Provider>
  );
};

export default AppEntry;

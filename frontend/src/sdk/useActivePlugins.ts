import * as React from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { getActivePlugins, PluginType } from '../Utils/plugins';
import packageInfo from '../../package.json';

const useActivePlugins = (): PluginType[] | null => {
  const { isBeta } = useChrome();
  const [plugins, setPlugins] = React.useState<PluginType[] | null>(null);

  React.useEffect(() => {
    if (isBeta !== undefined) {
      getActivePlugins(isBeta(), packageInfo.insights.appname).then((data) => {
        setPlugins(data);
        // TODO: do we need this?
        window.SERVER_FLAGS = {
          consolePlugins: data.map(({ name }) => name),
        };
      });
    }
  }, [isBeta]);

  return plugins;
};

export default useActivePlugins;

import * as React from 'react';
import noop from 'lodash/noop';
import { initConsolePlugins } from '@console/dynamic-plugin-sdk/src/runtime/plugin-init';
import { /* ActivePlugin, */ PluginStore } from '@console/plugin-sdk';
import { useReduxStore } from '../../redux';
import { getEnabledDynamicPluginNames } from './utils';
import { loadDynamicPlugin } from '@console/dynamic-plugin-sdk/src/runtime/plugin-loader';

export type EnabledPlugin = {
  name: string;
  pathPrefix?: string;
}

type PluginProps = {
  enabledPlugins?: EnabledPlugin[];
  onPluginRegister?: Function;
  pathPrefix?: String;
};

const IncludePlugins = ({ enabledPlugins, onPluginRegister = noop }: PluginProps) => {
  const [pluginStore, setPluginStore] = React.useState<PluginStore>();
  const store = useReduxStore();

  React.useEffect(() => {
    if (pluginStore) {
      enabledPlugins &&
        enabledPlugins.forEach(async ({ name: item, pathPrefix = '/api/plugins' }) => {
          const manifest = await (await fetch(`${pathPrefix}/${item}/plugin-manifest.json`)).json();
          loadDynamicPlugin(`${pathPrefix}/${item}/`, manifest).then((pluginName) => {
            pluginStore.setDynamicPluginEnabled(pluginName, true);
          });
        });
    }
  }, [enabledPlugins, pluginStore]);

  React.useEffect(() => {
    if (store) {
      const activePlugins = [];
      // process.env.NODE_ENV !== 'test'
      //   ? /* eslint-disable global-require, @typescript-eslint/no-require-imports */
      //     // eslint-disable-next-line import/no-unresolved
      //     (require('@console/active-plugins').default as ActivePlugin[])
      //   : [];
      const dynamicPluginNames = getEnabledDynamicPluginNames();
      const initialPluginStore = new PluginStore(activePlugins, dynamicPluginNames);

      initConsolePlugins(initialPluginStore, store, onPluginRegister);
      setPluginStore(initialPluginStore);
    }
  }, [onPluginRegister, store]);

  return null;
};

export default IncludePlugins;

import { getActivePlugins } from '../Utils/plugins';
import packageInfo from '../../package.json';
import { PluginLoader, PluginStore } from '@openshift/dynamic-plugin-sdk';

export const createStore = (store?: PluginStore) => {
  let internalStore = store;
  if (!internalStore) {
    const loader = new PluginLoader({
      postProcessManifest: (manifest) => ({
        ...manifest,
        loadScripts: manifest.loadScripts ?? ['plugin-entry.js'],
        registrationMethod: manifest.registrationMethod ?? 'callback',
      }),
    });
    loader.registerPluginEntryCallback();
    internalStore = new PluginStore();
    internalStore.setLoader(loader);
  }
  getActivePlugins(window.insights.chrome.isBeta(), packageInfo.insights.appname).then((data) => {
    data.forEach(({ name: item, pathPrefix = '/api/plugins' }) => {
      const url = `/beta${pathPrefix}/${item}/`;
      internalStore!.loadPlugin(url);
    });
  });
  return internalStore;
};

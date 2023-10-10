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
  let storeMajorVersion: number;
  try {
    // @ts-ignore
    storeMajorVersion = Number(internalStore?.sdkVersion?.split('.')?.[0] ?? '3');
  } catch {
    // fallback to pre v4 version
    storeMajorVersion = 3;
  }
  getActivePlugins(window.insights.chrome.isBeta(), packageInfo.insights.appname).then((data) => {
    data.forEach(({ name: item, pathPrefix = '/api/plugins' }) => {
      const url = storeMajorVersion < 4 ? `/beta${pathPrefix}/${item}/` : `/beta${pathPrefix}/${item}/plugin-manifest.json`;
      internalStore!.loadPlugin(url);
    });
  });
  return internalStore;
};

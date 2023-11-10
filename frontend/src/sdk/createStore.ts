import { getActivePlugins } from '../Utils/plugins';
import packageInfo from '../../package.json';
import { PluginStore } from '@openshift/dynamic-plugin-sdk';

export const createStore = (store?: PluginStore) => {
  let internalStore = store;
  if (!internalStore) {
    internalStore = new PluginStore({
      loaderOptions: {
        postProcessManifest: (manifest) => ({
          ...manifest,
          loadScripts: manifest.loadScripts ?? ['plugin-entry.js'],
          registrationMethod: manifest.registrationMethod ?? 'callback',
        }),
      },
    });
  }
  let storeMajorVersion: number;
  try {
    // @ts-ignore
    storeMajorVersion = Number(internalStore?.sdkVersion?.split('.')?.[0] ?? '3');
  } catch {
    // fallback to pre v4 version
    storeMajorVersion = 3;
  }
  // eslint-disable-next-line rulesdir/no-chrome-api-call-from-window
  getActivePlugins(window.insights.chrome.isBeta(), packageInfo.insights.appname).then((data) => {
    data.forEach(({ name: item, pathPrefix = '/api/plugins' }) => {
      const url = storeMajorVersion < 4 ? `/beta${pathPrefix}/${item}/` : `/beta${pathPrefix}/${item}/plugin-manifest.json`;
      internalStore!.loadPlugin(url);
    });
  });
  return internalStore;
};

import { getActivePlugins } from '../Utils/plugins';
import packageInfo from '../../package.json';
import { PluginStore } from '@openshift/dynamic-plugin-sdk';

export const createStore = (store: PluginStore) => {
  getActivePlugins(window.insights.chrome.isBeta(), packageInfo.insights.appname).then((data) => {
    data.forEach(({ name: item, pathPrefix = '/api/plugins' }) => {
      const url = `/beta${pathPrefix}/${item}/`;
      store.loadPlugin(url);
    });
  });
  return store;
};

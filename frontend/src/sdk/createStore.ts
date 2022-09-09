import { getActivePlugins } from '../Utils/plugins';
import packageInfo from '../../package.json';
import { PluginLoader, PluginLoaderOptions, PluginStore } from '@openshift/dynamic-plugin-sdk';

const modules: { [name: string]: () => Promise<() => any> } = {
  '@openshift/dynamic-plugin-sdk-utils': async () => () => require('@openshift/dynamic-plugin-sdk-utils'),
  '@openshift/dynamic-plugin-sdk': async () => () => require('@openshift/dynamic-plugin-sdk'),
  '@patternfly/react-core': async () => () => require('@patternfly/react-core'),
  '@patternfly/react-table': async () => () => require('@patternfly/react-table'),
  react: async () => () => require('react'),
  redux: async () => () => require('redux'),
  'react-helmet': async () => () => require('react-helmet'),
  'react-i18next': async () => () => require('react-i18next'),
  '@scalprum/react-core': async () => () => require('@scalprum/react-core'),
  'react-redux': async () => () => require('react-redux'),
  'react-router': async () => () => require('react-router'),
  'react-router-dom': async () => () => require('react-router-dom'),
};

const sharedScope = Object.keys(modules).reduce(
  (acc, moduleRequest) => ({
    ...acc,
    [moduleRequest]: {
      // The '*' semver range means "this shared module matches all requested versions",
      // i.e. make sure the plugin always uses the Console-provided shared module version
      '*': {
        get: modules[moduleRequest],
        // Indicates that Console has already loaded the shared module
        loaded: true,
      },
    },
  }),
  {},
);

export const createStore = () => {
  const fetchImpl: PluginLoaderOptions['fetchImpl'] = (url, requestInit) => {
    return fetch(url, requestInit);
  };

  const pluginLoader = new PluginLoader({ fetchImpl, sharedScope });
  pluginLoader.registerPluginEntryCallback();
  const pluginStore = new PluginStore();
  pluginStore.setLoader(pluginLoader);
  getActivePlugins(false, packageInfo.insights.appname).then((data) => {
    data.forEach(({ name: item, pathPrefix = '/api/plugins' }) => {
      const url = `/beta${pathPrefix}/${item}/`;
      pluginStore.loadPlugin(url);
    });
  });
  return pluginStore;
};
export const pluginStore = createStore();

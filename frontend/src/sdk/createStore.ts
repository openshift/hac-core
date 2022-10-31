import { getActivePlugins } from '../Utils/plugins';
import packageInfo from '../../package.json';
import { PluginLoader, PluginLoaderOptions, PluginStore } from '@openshift/dynamic-plugin-sdk';
import type { To, NavigateOptions } from 'react-router-dom';

const calculateTo = (to: To) => {
  if (typeof to === 'string' && !to.startsWith('/hac')) {
    return `/hac${to}`;
  } else if (typeof to !== 'string' && to.pathname && !to.pathname.startsWith('/hac')) {
    return {
      ...to,
      pathname: `/hac${to.pathname}`,
    };
  }

  return to;
};

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
  'react-router-dom': async () => () => {
    // We have to hack our way around react-router-dom
    // Since we are no longer using basename we have to include `/hac` prefix
    const reactRouter = require('react-router-dom');
    return {
      ...reactRouter,
      useNavigate: () => {
        const oldNavigate = reactRouter.useNavigate();
        return (to: To, options?: NavigateOptions) => {
          oldNavigate(calculateTo(to), options);
        };
      },
      Link: (props: any) => {
        const react = require('react');
        const Cmp = reactRouter.Link;
        const to = props.to.startsWith('/hac') ? props.to : `/hac${props.to}`;
        return react.createElement(Cmp, { ...props, to });
      },
      Navigate: (props: any) => {
        const react = require('react');
        const Cmp = reactRouter.Navigate;
        return react.createElement(Cmp, { ...props, to: calculateTo(props.to) });
      },
      NavLink: (props: any) => {
        const react = require('react');
        const Cmp = reactRouter.NavLink;
        return react.createElement(Cmp, { ...props, to: calculateTo(props.to) });
      },
    };
  },
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
  getActivePlugins(window.insights.chrome.isBeta(), packageInfo.insights.appname).then((data) => {
    data.forEach(({ name: item, pathPrefix = '/api/plugins' }) => {
      const url = `/beta${pathPrefix}/${item}/`;
      pluginStore.loadPlugin(url);
    });
  });
  return pluginStore;
};
export const pluginStore = createStore();

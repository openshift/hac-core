const { NormalModuleReplacementPlugin } = require('webpack');
const { resolve } = require('path');
const fedModulePlugin = require('@redhat-cloud-services/frontend-components-config/federated-modules');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const package = require('../package.json');

const plugins = [
  fedModulePlugin({
    root: resolve(__dirname, '../'),
    debug: true,
    exposes: {
      // Application root
      './RootApp': resolve(__dirname, '../src/AppEntry'),
      // System detail
      './Navigation': resolve(__dirname, '../src/Navigation'),
    },
    shared: [
      { 'react-router-dom': { singleton: true, requiredVersion: package.dependencies['react-router-dom'] } },
      { 'react-redux': { singleton: true, requiredVersion: package.dependencies['react-redux'] } },
      { '@openshift/dynamic-plugin-sdk-utils': { singleton: true, requiredVersion: package.dependencies['@openshift/dynamic-plugin-sdk-utils'] } },
      { '@openshift/dynamic-plugin-sdk': { singleton: true, requiredVersion: package.dependencies['@openshift/dynamic-plugin-sdk'] } },
      { 'Sdk/createStore': { singleton: true } },
    ],
  }),
  new CopyWebpackPlugin({
    patterns: [{ from: 'static' }],
  }),
];

// Save 20kb of bundle size in prod
if (process.env.NODE_ENV === 'production') {
  plugins.push(new NormalModuleReplacementPlugin(/redux-logger/, resolve(__dirname, './empty.js')));
}

module.exports = plugins;

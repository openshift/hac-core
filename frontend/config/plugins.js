const { NormalModuleReplacementPlugin } = require('webpack');
const { resolve } = require('path');
const fedModulePlugin = require('@redhat-cloud-services/frontend-components-config-utilities/federated-modules');
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
      { redux: { singleton: true, requiredVersion: package.dependencies.redux, version: package.dependencies.redux } },
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          requiredVersion: package.dependencies['react-router-dom'],
          version: package.dependencies['react-router-dom'],
        },
      },
      { 'react-redux': { singleton: true, requiredVersion: package.dependencies['react-redux'], version: package.dependencies['react-redux'] } },
      { '@scalprum/core': { singleton: true, version: package.devDependencies['@scalprum/core'] } },
      { '@scalprum/react-core': { singleton: true, version: package.devDependencies['@scalprum/react-core'] } },
      {
        '@openshift/dynamic-plugin-sdk-utils': {
          singleton: true,
          requiredVersion: package.dependencies['@openshift/dynamic-plugin-sdk-utils'],
          version: package.dependencies['@openshift/dynamic-plugin-sdk-utils'],
        },
      },
      {
        '@openshift/dynamic-plugin-sdk': {
          singleton: true,
          requiredVersion: package.dependencies['@openshift/dynamic-plugin-sdk'],
          version: package.dependencies['@openshift/dynamic-plugin-sdk'],
        },
      },
      {
        '@openshift/dynamic-plugin-sdk-extensions': {
          singleton: true,
          requiredVersion: package.dependencies['@openshift/dynamic-plugin-sdk-extensions'],
          version: package.dependencies['@openshift/dynamic-plugin-sdk-extensions'],
        },
      },
      { '@patternfly/quickstarts': { singleton: true, requiredVersion: '*', version: '*' } },
      { 'Sdk/createStore': { singleton: true, requiredVersion: '*', version: '*' } },
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

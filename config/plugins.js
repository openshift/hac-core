const webpack = require('webpack');
const { resolve } = require('path');
const fedModulePlugin = require('@redhat-cloud-services/frontend-components-config/federated-modules');
// const VirtualModulesPlugin = require('webpack-virtual-modules');
//
// const {
//   ConsoleActivePluginsModule,
// } = require('../src/poc-code/console-plugin-sdk/src/webpack/ConsoleActivePluginsModule');
// const {
//   resolvePluginPackages,
// } = require('../src/poc-code/console-plugin-sdk/src/codegen/plugin-resolver');
//
// const virtualModules = new VirtualModulesPlugin();

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
  }),
];

// Save 20kb of bundle size in prod
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /redux-logger/,
      resolve(__dirname, './empty.js')
    )
  );
}

module.exports = plugins;

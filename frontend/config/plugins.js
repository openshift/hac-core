const { NormalModuleReplacementPlugin } = require('webpack');
const { resolve } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const plugins = [
  new CopyWebpackPlugin({
    patterns: [{ from: 'static' }],
  }),
];

// Save 20kb of bundle size in prod
if (process.env.NODE_ENV === 'production') {
  plugins.push(new NormalModuleReplacementPlugin(/redux-logger/, resolve(__dirname, './empty.js')));
}

module.exports = plugins;

const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const commonPlugins = require('./plugins');

const insightsProxy = {
  https: false,
  ...(process.env.BETA && { deployment: 'beta/apps' }),
};

const webpackProxy = {
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  useProxy: true,
  env: `stage-${process.env.BETA ? 'beta' : 'stable'}`, // for accessing prod-beta change this to 'prod-beta'
  appUrl: process.env.BETA ? '/beta/hac' : '/hac',
  standalone: Boolean(process.env.STANDALONE),
  ...(process.env.API_PORT && {
    routes: {
      '/api/hac': { host: `http://localhost:${process.env.API_PORT}` },
    },
  }),
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  useFileHash: false,
  ...(process.env.PROXY ? webpackProxy : insightsProxy),
});

plugins.push(...commonPlugins);

module.exports = {
  ...webpackConfig,
  plugins,
};

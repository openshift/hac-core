const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const commonPlugins = require('./plugins');
const mergeTsConfigAliases = require('./mergeTsConfigAliases');

const insightsProxy = {
  https: false,
  ...(process.env.BETA && { deployment: 'beta/apps' }),
};

const environment = process.env.ENVIRONMENT || 'stage';
const betaOrStable = process.env.BETA ? 'beta' : 'stable';
// for accessing prod-beta change this to 'prod-beta'
const env = `${environment}-${betaOrStable}`;

const pluginProxy = (name, port = 8003, pathRewrite = false) => ({
  context: [`/beta/api/plugins/${name}`, `/api/plugins/${name}`],
  // In order to serve your plugin locally on your server change this line ↓
  target: `http://localhost:${port}`,
  secure: false,
  changeOrigin: true,
  ...(pathRewrite && {
    pathRewrite: {
      // if you don't want to rewrite `/beta/api/plugins` to `/api/plugins` remove this line
      [`^/beta/api/plugins/${name}`]: `/api/plugins/${name}`,
    },
  }),
});

const calculateRemoteConfig = (remoteConfig) => {
  if (remoteConfig === 'stage') {
    return 'https://console.stage.redhat.com';
  } else if (remoteConfig === 'prod') {
    return 'https://console.redhat.com';
  }

  return `https://${remoteConfig}.console.redhat.com`;
};

const webpackProxy = {
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  useProxy: true,
  env,
  appUrl: process.env.BETA ? '/beta/hac' : '/hac',
  sassPrefix: '.hacCore',
  standalone: Boolean(process.env.STANDALONE),
  ...(process.env.INSIGHTS_CHROME && {
    localChrome: process.env.INSIGHTS_CHROME,
  }),
  routes: {
    ...(process.env.API_PORT && {
      '/api/hac': { host: `http://localhost:${process.env.API_PORT}` },
    }),
    ...(process.env.REMOTE_CONFIG && {
      [`${process.env.BETA ? '/beta' : ''}/config`]: {
        host: calculateRemoteConfig(process.env.REMOTE_CONFIG),
      },
    }),
    ...(process.env.CONFIG_PORT && {
      [`${process.env.BETA ? '/beta' : ''}/config`]: {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
    }),
  },
  customProxy: [
    {
      context: (path) => path.includes('/api/k8s/registration'),
      target: 'https://registration-service-toolchain-host-operator.apps.appstudio-stage.x99m.p1.openshiftapps.com',
      secure: false,
      changeOrigin: true,
      autoRewrite: true,
      ws: true,
      pathRewrite: { '^/api/k8s/registration': '' },
    },
    {
      context: (path) => path.includes('/api/k8s'),
      target: 'https://api-toolchain-host-operator.apps.appstudio-stage.x99m.p1.openshiftapps.com:443',
      secure: false,
      changeOrigin: true,
      autoRewrite: true,
      ws: true,
      pathRewrite: { '^/api/k8s': '' },
    },
    pluginProxy('hac-dev'),
    pluginProxy('hac-infra'),
    {
      context: (path) => path.includes('/wss/k8s'),
      target: 'wss://api-toolchain-host-operator.apps.appstudio-stage.x99m.p1.openshiftapps.com:443',
      secure: false,
      changeOrigin: true,
      autoRewrite: true,
      ws: true,
      pathRewrite: { '^/wss/k8s': '' },
    },
  ],
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  useFileHash: false,
  ...(process.env.PROXY ? webpackProxy : insightsProxy),
});

plugins.push(...commonPlugins);

webpackConfig.devServer.client.overlay = false;

module.exports = mergeTsConfigAliases({
  ...webpackConfig,
  plugins,
});

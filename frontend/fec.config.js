const { resolve } = require('path');
const { tsConfigAliases } = require('./config/mergeTsConfigAliases');
const commonPlugins = require('./config/plugins');
const package = require('./package.json');

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

module.exports = {
  appUrl: '/hac',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  /**
   * Change to false after your app is registered in configuration files
   */
  interceptChromeConfig: false,
  sassPrefix: '.hacCore',
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
  plugins: commonPlugins,
  moduleFederation: {
    root: resolve(__dirname, './'),
    debug: true,
    exposes: {
      // Application root
      './RootApp': resolve(__dirname, './src/AppEntry'),
      // System detail
      './Navigation': resolve(__dirname, './src/Navigation'),
    },
    shared: [
      { 'react-router-dom': { requiredVersion: package.dependencies['react-router-dom'] } },
      { 'react-redux': { singleton: true, requiredVersion: package.dependencies['react-redux'] } },
      { '@openshift/dynamic-plugin-sdk-utils': { singleton: true, requiredVersion: package.dependencies['@openshift/dynamic-plugin-sdk-utils'] } },
      { '@openshift/dynamic-plugin-sdk': { singleton: true, requiredVersion: package.dependencies['@openshift/dynamic-plugin-sdk'] } },
      {
        '@openshift/dynamic-plugin-sdk-extensions': {
          singleton: true,
          requiredVersion: package.dependencies['@openshift/dynamic-plugin-sdk-extensions'],
        },
      },
      { '@patternfly/quickstarts': { singleton: true, requiredVersion: '*' } },
      { 'Sdk/createStore': { singleton: true, requiredVersion: '*' } },
    ],
  },
  resolve: {
    alias: tsConfigAliases,
  },
};

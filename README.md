# hac-core

Core repo for the Hybrid Application Console (HAC) project. Manages the connectivity between the ConsoleDot Chrome & the HAC Dynamic Plugins.

## Dynamic Plugins

This repo will closely work with the [SDK for Dynamic Plugins](https://github.com/openshift/dynamic-plugin-sdk) to deliver a consistent interface that loads Dynamic Plugins.

> Note: Today it includes a hacked up version of the SDK to allow us to configure and set up the interface between ConsoleDot and Dynamic Plugins

### Local development

If you want to run your plugin locally with hac-core you will have to update /config/dev.webpack.config.js routes to include your plugin. Then you will have to install and run this application

```
cd frontend
yarn install
yarn dev
```

### Running with dynamic plugins - openshift console

If you want to run with dynamic plugin from openshift console, simply host the dynamic plugin from the console with backend bridge.

```
./bin/bridge -plugins console-demo-plugin=http://localhost:9001/
```

### Running with dynamic plugins - new dynamic plugin

If you want to run the hac-core with dynamic plugin served outside openshift no need for any extra steps. Just run your dynamic plugin using `npm run start:federated` and hac-core with `yarn dev`. This will start dynamic plugin in federation mode and hac-core will be the host application. The path over which your plugin is available will be printed when starting it, you should then go to `/config/dev.webpack.config.js` and adjust it based on the comments there. After adjusting it, you should restart the `hac-core` app.

## Development

To install & build (for production) the code you can run `./build.sh`.

To verify everything is ready for a Pull Request you can run `./test.sh`.

If you wish to debug or contribute, see [the frontend README](./frontend/README.md).

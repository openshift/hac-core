# hac-core

Core repo for the Hybrid Application Console (HAC) project. Manages the connectivity between the ConsoleDot Chrome & the HAC Dynamic Plugins.

## Dynamic Plugins

This repo will closely work with the [SDK for Dynamic Plugins](https://github.com/openshift/dynamic-plugin-sdk) to deliver a consistent interface that loads Dynamic Plugins.

> Note: Today it includes a hacked up version of the SDK to allow us to configure and set up the interface between ConsoleDot and Dynamic Plugins

## Development

To install & build (for production) the code you can run `./build.sh`.

To verify everything is ready for a Pull Request you can run `./test.sh`.

If you wish to debug or contribute, see [the frontend README](./frontend/README.md).

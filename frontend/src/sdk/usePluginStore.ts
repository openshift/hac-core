import { PluginStore } from '@openshift/dynamic-plugin-sdk';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import useActivePlugins from './useActivePlugins';

// TODO(SDK): Expose
type ResourceFetch = (url: string, requestInit?: RequestInit, isK8sAPIRequest?: boolean) => Promise<Response>;

const fetchImpl: ResourceFetch = (url, requestInit) => {
  return fetch(url, requestInit);
};

const usePluginStore = (): PluginStore | null => {
  const { isBeta } = useChrome();
  const base = isBeta?.() ? '/beta' : '';
  const plugins = useActivePlugins();

  if (!plugins) {
    return null;
  }

  const pluginStore = new PluginStore({
    loaderOptions: {
      fetchImpl,
    },
  });
  plugins.forEach(({ name: item, pathPrefix = '/api/plugins' }) => {
    pluginStore.loadPlugin(`${base}${pathPrefix}/${item}/plugin-manifest.json`);
  });

  return pluginStore;
};

export default usePluginStore;

export type PluginType = {
  name: string;
  pathPrefix?: string;
};

type GetActivePlugins = (isBeta: boolean, appName: string) => Promise<PluginType[]>;

export const getActivePlugins: GetActivePlugins = async (isBeta, appName) => {
  try {
    const response = await fetch(`${isBeta ? '/beta' : ''}/apps/${appName}/plugins.json`);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    if (!isJson) {
      throw new Error('plugin data response is not type application/json');
    }
    return await response.json();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch plugin data', e);
    return [];
  }
};

export type PluginType = {
  name: string;
  pathPrefix?: string;
};

type GetActivePlugins = (isBeta: boolean, appName: string) => Promise<PluginType[]>;

export const getActivePlugins: GetActivePlugins = async (isBeta, appName) => {
  try {
    return (await fetch(`${isBeta ? '/beta' : ''}/apps/${appName}/plugins.json`)).json();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch plugin data', e);
    return [];
  }
};

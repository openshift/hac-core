export type PluginType = {
  name: string;
  pathPrefix?: string;
};

type GetActivePlugins = (isBeta: boolean, appName: string) => Promise<PluginType[]>;

export const getActivePlugins: GetActivePlugins = async (isBeta, appName) =>
  (await fetch(`${isBeta ? '/beta' : ''}/apps/${appName}/plugins.json`)).json();

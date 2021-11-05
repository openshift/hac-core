import { activePlugins } from './Utils/constants';

export default async ({ dynamicNav, currentNamespace }) => {
  const [appId, navSection] = dynamicNav.split('/');
  const routes = [];
  routes.push(
    ...activePlugins.flatMap(async (pluginName) => {
      const { extensions } = (await (await fetch(`/api/plugins/${pluginName}/plugin-manifest.json`))?.json()) || {};
      return extensions
        .filter(({ type, properties }) => type.includes('console.navigation') && properties.section === navSection)
        .map((extension) => ({
          appId,
          href: `/${currentNamespace}/${navSection}${extension.properties.href}`,
          title: extension.properties.name,
        }));
    }),
  );
  return {
    expandable: true,
    routes: (await Promise.all(routes)).flat(),
  };
};

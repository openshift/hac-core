import { activePlugins } from './Utils/constants';

export default async ({ dynamicNav, currentNamespace }) => {
  const [appId, navSection] = dynamicNav.split('/');
  const routes = [];
  routes.push(
    ...activePlugins.flatMap(async (item) => {
      const { extensions } =
        (await (
          await fetch(`/api/plugins/${item}/plugin-manifest.json`)
        )?.json()) || {};
      return extensions
        .filter(
          ({ type, properties }) =>
            type.includes('console.navigation') &&
            properties.section === navSection
        )
        .map((item) => ({
          appId,
          href: `/${currentNamespace}/${navSection}${item.properties.href}`,
          title: item.properties.name,
        }));
    })
  );
  return {
    expandable: true,
    routes: (await Promise.all(routes)).flat(),
  };
};

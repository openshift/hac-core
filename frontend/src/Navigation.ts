import { activePlugins } from './Utils/constants';
import { HrefNavItem, NavSection } from '@console/dynamic-plugin-sdk/src';

export interface RouteProps {
  isHidden?: boolean;
  appId?: string;
  href?: string;
  title?: string;
}

export interface DynamicNav {
  dynamicNav: string;
  currentNamespace: string;
}

export type GetAllExtensions = () => Promise<(HrefNavItem | NavSection)[]>;
export type CalculateRoutes = (navIdentifier: [string, string], currentNamespace: string, extensions: (HrefNavItem | NavSection)[]) => RouteProps[];

const getAllExtensions: GetAllExtensions = async () => {
  return (
    await Promise.all(
      activePlugins.flatMap(async (pluginName: string) => {
        const { extensions } = (await (await fetch(`/api/plugins/${pluginName}/plugin-manifest.json`))?.json()) || {};
        return extensions;
      }),
    )
  ).flat();
};

const calculateRoutes: CalculateRoutes = ([appId, navSection], currentNamespace, extensions) => {
  return extensions
    .filter(({ type, properties }: HrefNavItem) => type.includes('console.navigation/href') && properties.section === navSection)
    .map((extension: HrefNavItem) => ({
      appId,
      href: `/${currentNamespace}${navSection ? `/${navSection}` : ''}${extension.properties.href}`,
      title: extension.properties.name,
    }));
};

export default async ({ dynamicNav, currentNamespace }: DynamicNav) => {
  const [appId, navSection] = dynamicNav.split('/');
  let allExtensions = [];
  let routes: RouteProps | RouteProps[];
  try {
    allExtensions = await getAllExtensions();
    routes = calculateRoutes([appId, navSection], currentNamespace, allExtensions);
  } catch {
    routes = [{ isHidden: true }];
  }
  const { properties: currSection } =
    allExtensions.find(({ type, properties }: NavSection) => type === 'console.navigation/section' && properties.id === navSection) || {};
  return currSection
    ? {
        expandable: true,
        title: currSection.name,
        routes,
      }
    : routes;
};

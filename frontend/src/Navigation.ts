import { activePlugins } from './Utils/constants';
import { HrefNavItem, NavSection } from '@console/dynamic-plugin-sdk/src';
import { EnabledPlugin } from '@console/mount/src/components/plugins/IncludePlugins';
import { Extension } from '@console/dynamic-plugin-sdk/src/types';
import { ConsolePluginManifestJSON } from '@console/dynamic-plugin-sdk/src/schema/plugin-manifest';

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

const navExtensionTypes = ['console.navigation/href', 'console.navigation/section'];
type NavExtension = HrefNavItem | NavSection;

export type GetAllExtensions = () => Promise<NavExtension[]>;
export type CalculateRoutes = (navIdentifier: [string, string], currentNamespace: string, extensions: (HrefNavItem | NavSection)[]) => RouteProps[];

const isFulfilledPromise = (result: PromiseSettledResult<Extension[]>): result is PromiseFulfilledResult<Extension[]> => {
  return result.status === 'fulfilled' && Boolean(result.value);
};

const isNavItem = (extension: Extension): extension is NavExtension => {
  return navExtensionTypes.includes(extension.type);
};

const getAllExtensions: GetAllExtensions = async () => {
  const results: PromiseSettledResult<Extension[]>[] = await Promise.allSettled(
    activePlugins.flatMap(async ({ name: pluginName, pathPrefix = '/api/plugins' }: EnabledPlugin) => {
      const url = `${pathPrefix}/${pluginName}/plugin-manifest.json`;
      const response: Response = await fetch(url);
      if (response.status !== 200) {
        const msg = `${url} - ${response.status} - ${response.statusText}`;
        // eslint-disable-next-line no-console
        console.error(msg);
        throw new Error(msg);
      }
      const manifest: ConsolePluginManifestJSON = await response.json();
      return manifest.extensions;
    }),
  );

  return results
    .filter(isFulfilledPromise)
    .map(({ value }) => value)
    .flat()
    .filter(isNavItem);
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
  let allExtensions: NavExtension[] = [];
  let routes: RouteProps | RouteProps[];
  try {
    allExtensions = await getAllExtensions();
    routes = calculateRoutes([appId, navSection], currentNamespace, allExtensions);
  } catch (e) {
    routes = [{ isHidden: true }];
    // eslint-disable-next-line no-console
    console.error('Problem fetching extensions', e);
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

import * as React from 'react';
import { getActivePlugins } from './Utils/plugins';
import { HrefNavItem, PluginManifest, Extension, NavSection, isNavSection } from '@openshift/dynamic-plugin-sdk';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import packageInfo from '../package.json';

export type EnabledPlugin = {
  name: string;
  pathPrefix?: string;
};

export interface RouteProps {
  isHidden?: boolean;
  appId?: string;
  href?: string;
  title?: string;
}

export interface DynamicNav {
  dynamicNav: string;
  currentNamespace: string;
  base?: string;
  isBeta?: () => boolean;
}

const navExtensionTypes = ['console.navigation/href', 'console.navigation/section'];
type NavExtension = HrefNavItem | NavSection;

export type GetAllExtensions = (base?: string, isBeta?: () => boolean) => Promise<NavExtension[]>;
export type CalculateRoutes = (navIdentifier: [string, string], currentNamespace: string, extensions: (HrefNavItem | NavSection)[]) => RouteProps[];
export type Navigation = {
  expandable: boolean;
  title: string;
  routes: RouteProps[];
};

const isFulfilledPromise = (result: PromiseSettledResult<Extension[]>): result is PromiseFulfilledResult<Extension[]> => {
  return result.status === 'fulfilled' && Boolean(result.value);
};

const isNavItem = (extension: Extension): extension is NavExtension => {
  return navExtensionTypes.includes(extension.type);
};

const getAllExtensions: GetAllExtensions = async (base = '', isBeta = () => false) => {
  const plugins = await getActivePlugins(isBeta(), packageInfo.insights.appname);
  const results: PromiseSettledResult<Extension[]>[] = await Promise.allSettled(
    plugins.flatMap(async ({ name: pluginName, pathPrefix = '/api/plugins' }: EnabledPlugin) => {
      const url = `${base}${pathPrefix}/${pluginName}/plugin-manifest.json`;
      const response: Response = await fetch(url);
      if (response.status !== 200) {
        const msg = `${url} - ${response.status} - ${response.statusText}`;
        // eslint-disable-next-line no-console
        console.error(msg);
        throw new Error(msg);
      }
      const manifest: PluginManifest = await response.json();
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

const calculateNavigation = async ({ dynamicNav, currentNamespace, base, isBeta }: DynamicNav): Promise<Navigation | RouteProps[]> => {
  const [appId, navSection] = dynamicNav.split('/');
  let allExtensions: NavExtension[] = [];
  let routes: RouteProps | RouteProps[];
  try {
    allExtensions = await getAllExtensions(base, isBeta);
    routes = calculateRoutes([appId, navSection], currentNamespace, allExtensions);
    if (routes.length === 0) {
      routes = [{ isHidden: true }];
    }
  } catch (e) {
    routes = [{ isHidden: true }];
    // eslint-disable-next-line no-console
    console.error('Problem fetching extensions', e);
  }
  const { properties: currSection } = allExtensions.find((extension: NavSection) => isNavSection(extension)) || {};
  return currSection
    ? {
        expandable: true,
        title: currSection.name,
        routes,
      }
    : routes;
};

/**
 * Hook to be used by chrome to calculate navigation chunks.
 * @param { dynamicNav, currentNamespace }
 *  * dynamicNav - entry idicating dynamic navigation
 *  * currentNamespace - current app namespace
 * @returns either navigation object for nested items or array of navigation object for multiple entries.
 */
export const useNavigation = ({ dynamicNav, currentNamespace }: DynamicNav): Navigation | RouteProps[] => {
  const [navigation, setNavigation] = React.useState<Navigation | RouteProps[]>();
  const unmounted = React.useRef<boolean>(false);
  const { isBeta } = useChrome();
  React.useEffect(() => {
    if (dynamicNav) {
      // this is just one off for now, but we can start building on this
      calculateNavigation({ dynamicNav, currentNamespace, base: isBeta() ? `/beta` : '', isBeta }).then((data: Navigation | RouteProps[]) => {
        if (!unmounted.current) {
          setNavigation(data);
        }
      });
    }

    return () => {
      unmounted.current = true;
    };
  }, [dynamicNav, currentNamespace]);

  return navigation;
};

export default calculateNavigation;

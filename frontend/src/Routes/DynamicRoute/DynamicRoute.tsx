import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useExtensions, useResolvedExtensions } from '@openshift/dynamic-plugin-sdk';
import { isRoutePage as isDynamicRoutePage, RoutePage as DynamicRoutePage, isContextProvider } from '@openshift/dynamic-plugin-sdk-extensions';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { PageSection } from '@patternfly/react-core/dist/dynamic/components/Page';
import { ErrorState } from '@patternfly/react-component-groups';
import camelCase from 'lodash/camelCase';
import ProviderWrapper from '../../Utils/ProviderWrapper';

const Loader = () => (
  <Bullseye>
    <Spinner />
  </Bullseye>
);

type DynamicRouteProps = {
  location?: Location;
};

const DynamicRoute: React.FC<DynamicRouteProps> = () => {
  const dynamicRoutePages = useExtensions<DynamicRoutePage>(isDynamicRoutePage);
  const [contextProviderExtensions, providersResolved] = useResolvedExtensions(isContextProvider);

  const routes = React.useMemo(
    () =>
      dynamicRoutePages.flatMap(({ properties: { component, path, exact, ...currRoute }, pluginName, uid }) => {
        return (Array.isArray(path) ? path : [path]).map((currPath) => ({
          ...currRoute,
          path: !exact ? `${currPath.replace('/application-pipeline', '')}/*` : currPath.replace('/application-pipeline', ''),
          uid,
          className: camelCase(pluginName),
          Component: React.lazy(async () => {
            try {
              return {
                default: (await component()) || Loader,
              };
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error(e);
              return {
                default: () => (
                  <Bullseye>
                    <ErrorState errorTitle={`There was an error while loading ${pluginName} plugin.`} />
                  </Bullseye>
                ),
              };
            }
          }),
        }));
      }),
    [dynamicRoutePages],
  );

  return (
    <React.Suspense fallback={null}>
      {providersResolved &&
        contextProviderExtensions.reduce(
          (children, extension) => (
            <ProviderWrapper key={extension.uid} {...extension.properties}>
              {children}
            </ProviderWrapper>
          ),
          <Routes>
            {routes.map(({ className, Component, uid, ...currCoute }) => (
              <Route
                {...currCoute}
                key={uid}
                element={
                  <PageSection className={`${className} pf-m-no-padding`}>
                    <Component />
                  </PageSection>
                }
              />
            ))}
          </Routes>,
        )}
    </React.Suspense>
  );
};

export default DynamicRoute;

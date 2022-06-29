import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useExtensions, isRoutePage as isDynamicRoutePage, RoutePage as DynamicRoutePage } from '@openshift/dynamic-plugin-sdk';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import camelCase from 'lodash/camelCase';

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

  const routes = React.useMemo(
    () =>
      dynamicRoutePages.flatMap(({ properties: { component, path, exact, ...currRoute }, pluginName, uid }) => {
        return (Array.isArray(path) ? path : [path]).map((currPath) => ({
          ...currRoute,
          path: !exact ? `${currPath}/*` : currPath,
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
      <Routes>
        {routes.map(({ className, Component, uid, ...currCoute }) => (
          <Route
            {...currCoute}
            key={uid}
            element={
              <article className={className}>
                <Component />
              </article>
            }
          />
        ))}
      </Routes>
    </React.Suspense>
  );
};

export default DynamicRoute;

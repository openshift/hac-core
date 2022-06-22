import * as React from 'react';
import { Route } from 'react-router-dom';
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
      dynamicRoutePages.map(({ properties: { component, ...currRoute }, pluginName, uid }) => {
        return {
          ...currRoute,
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
        };
      }),
    [dynamicRoutePages],
  );

  return (
    <React.Suspense fallback={null}>
      {routes.map(({ className, Component, uid, ...currCoute }) => (
        <Route
          {...currCoute}
          key={uid}
          render={() => (
            <article className={className}>
              <Component />
            </article>
          )}
        />
      ))}
    </React.Suspense>
  );
};

export default DynamicRoute;

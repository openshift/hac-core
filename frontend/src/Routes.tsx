import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { Bullseye, Spinner } from '@patternfly/react-core';
import EmptyRoute from '@console/mount/src/components/foundation/static-routes/EmptyRoute';
import TestK8s from './poc-code/testK8s/TestK8s';

const DynamicRoute = React.lazy(() => import(/* webpackChunkName: "DynamicRoute" */ './Routes/DynamicRoute/DynamicRoute'));

export const Routes: React.FC = () => (
  <React.Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <Switch>
      <Route exact path="/testK8s" component={TestK8s} />
      <Route path="/:dynamicPath" component={DynamicRoute} />
      <Route exact path="/" component={EmptyRoute} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  </React.Suspense>
);

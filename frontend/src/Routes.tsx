import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { Bullseye, Spinner } from '@patternfly/react-core';

const DynamicRoute = React.lazy(() => import(/* webpackChunkName: "DynamicRoute" */ './Routes/DynamicRoute/DynamicRoute'));
const EmptyRoute = React.lazy(() => import(/* webpackChunkName: "EmptyRoute" */ './Routes/EmptyRoute'));
const TestK8s = React.lazy(() => import(/* webpackChunkName: "TestK8s" */ './Routes/testK8s/TestK8s'));

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

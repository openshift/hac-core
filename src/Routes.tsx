import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { Bullseye, Spinner } from '@patternfly/react-core';
import EmptyRoute from '@console/mount/src/components/foundation/static-routes/EmptyRoute';

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
      <Route path="/:dynamicPath" component={DynamicRoute} />
      <Route exact path="/" component={EmptyRoute} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  </React.Suspense>
);

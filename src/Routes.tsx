import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { Bullseye, Spinner } from '@patternfly/react-core';
import EmptyRoute from '@console/mount/src/components/foundation/static-routes/EmptyRoute';

export const Routes: React.FC = () => (
  <React.Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <Switch>
      <Route path="/" component={EmptyRoute} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  </React.Suspense>
);

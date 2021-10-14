import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { Bullseye, Spinner } from '@patternfly/react-core';

const SamplePage = lazy(() =>
  import(/* webpackChunkName: "SamplePage" */ './Routes/SamplePage/SamplePage')
);

export const Routes: React.FC = () => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <Switch>
      <Route path="/" component={SamplePage} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  </Suspense>
);

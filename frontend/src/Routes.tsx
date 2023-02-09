import * as React from 'react';
import { Route, Routes as DomRoutes } from 'react-router-dom';

import { Bullseye, Spinner } from '@patternfly/react-core';

const DynamicRoute = React.lazy(() => import(/* webpackChunkName: "DynamicRoute" */ './Routes/DynamicRoute/DynamicRoute'));

export const Routes: React.FC = () => (
  <React.Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <DomRoutes>
      <Route path="*" element={<DynamicRoute />} />
    </DomRoutes>
  </React.Suspense>
);

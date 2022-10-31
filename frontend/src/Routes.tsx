import * as React from 'react';
import { Route, Routes as DomRoutes } from 'react-router-dom';

import { Bullseye, Spinner } from '@patternfly/react-core';

const DynamicRoute = React.lazy(() => import(/* webpackChunkName: "DynamicRoute" */ './Routes/DynamicRoute/DynamicRoute'));
const TestK8s = React.lazy(() => import(/* webpackChunkName: "TestK8s" */ './Routes/testK8s/TestK8s'));

export const Routes: React.FC = () => (
  <React.Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <DomRoutes>
      <Route path="/hac/testK8s" element={<TestK8s />} />
      <Route path="/hac/*" element={<DynamicRoute />} />
    </DomRoutes>
  </React.Suspense>
);

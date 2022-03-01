/* eslint-disable no-console */
import * as React from 'react';
import { PageSection } from '@patternfly/react-core';
import WSTest from './WSTest';
import FetchTest from './FetchTest';

const TestK8s: React.FC = () => {
  return (
    <PageSection>
      <FetchTest />
      <hr style={{ margin: 20 }} />
      <WSTest />
    </PageSection>
  );
};

export default TestK8s;

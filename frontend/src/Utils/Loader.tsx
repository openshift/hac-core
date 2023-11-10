import * as React from 'react';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';

const Loader = () => (
  <Bullseye>
    <Spinner />
  </Bullseye>
);

export default Loader;

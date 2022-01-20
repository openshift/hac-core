import * as React from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';

const Loader = () => (
  <Bullseye>
    <Spinner />
  </Bullseye>
);

export default Loader;

import * as React from 'react';
import { render } from 'react-dom';
import AppEntry from './AppEntry';

// import './poc-code/console-mount/src/dependencies';

const root = document.getElementById('root');

render(<AppEntry />, root, () => root.setAttribute('data-ouia-safe', 'true'));

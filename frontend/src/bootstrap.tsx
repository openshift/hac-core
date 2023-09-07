import * as React from 'react';
import { createRoot } from 'react-dom/client';
import AppEntry from './AppEntry';

const container = document.getElementById('root') as Element;
const root = createRoot(container);

// After
function AppWithCallbackAfterRender() {
  React.useEffect(() => {
    container!.setAttribute('data-ouia-safe', 'true');
  });

  return <AppEntry />;
}

root.render(AppWithCallbackAfterRender);

/* eslint-disable no-console */
import * as React from 'react';
import { WSFactory } from './ws-factory';

const getToken = (): string | null => {
  const cookieToken = document.cookie.split('; ').find((val) => val.startsWith('cs_jwt='));
  if (!cookieToken) {
    // Promise.reject('Could not make k8s call. Unable to find token.');
    console.error('no token??', typeof cookieToken, cookieToken);
    return null;
  }
  const [, token] = cookieToken.split('=');

  return token;
};
const base64 = (data: string): string => {
  // console.debug('equals??', btoa(data).replace(/\+/g, '-').replace(/\//g, '_').split('=', 1)[0]);
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').split('=', 1)[0];
};

const WSTest = () => {
  const ref = React.useRef<WSFactory>(null);

  // To get WS to work even a bit, we need to modify @redhat-cloud-services/frontend-components-config-utilities
  // in 'frontend/node_modules/@redhat-cloud-services/frontend-components-config-utilities/repos/insights-chrome-build/snippets/head.html'
  // 'wss:' needs to exist next to 'https:'
  React.useEffect(() => {
    console.debug('+++++++hook start+++++++');
    const token = getToken();

    if (token) {
      const base64Token = base64(token);

      ref.current = new WSFactory('sample websocket', {
        host: 'wss://api-toolchain-host-operator.apps.appstudio-stage.x99m.p1.openshiftapps.com:443',
        path: `/apis/appstudio.redhat.com/v1alpha1/namespaces/aballantyne/applications?watch=true`,
        subprotocols: [`base64url.bearer.authorization.k8s.io.${base64Token}`, 'base64.binary.k8s.io'],
      });
      ref.current.onerror((data) => {
        console.debug('error', data);
      });
      ref.current.onmessage((data) => {
        console.debug('message', data);
      });
      ref.current.onclose((data) => {
        // https://www.rfc-editor.org/rfc/rfc6455#section-11.7
        // 1006: https://stackoverflow.com/a/19305172
        console.debug('close', data, data.code);
      });
      ref.current.onbulkmessage((data) => {
        console.debug('bulkmessage', data);
      });
      ref.current.onopen((data) => {
        console.debug('open', data);
      });
      ref.current.ondestroy((data) => {
        console.debug('destroy', data);
      });
    } else {
      console.debug('>>>>>>>>failed to get token');
    }

    return () => {
      console.debug('------hook unload------');
      ref.current.destroy();
      ref.current = null;
    };
  }, []);

  // TODO: Print watched resource
  return <div>Hello World</div>;
};

export default WSTest;

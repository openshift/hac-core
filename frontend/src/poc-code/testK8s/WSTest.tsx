/* eslint-disable no-console */
import * as React from 'react';
import { WSFactory } from './ws-factory';
import PrintObject from './PrintObject';
import { Alert, Button, Spinner, Title } from '@patternfly/react-core';

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
  const [r, setR] = React.useState(null);
  const [createSocket, setCreateSocket] = React.useState(false);
  const [error, setError] = React.useState(null);

  // To get WS to work even a bit, we need to modify @redhat-cloud-services/frontend-components-config-utilities
  // in 'frontend/node_modules/@redhat-cloud-services/frontend-components-config-utilities/repos/insights-chrome-build/snippets/head.html'
  // 'wss:' needs to exist next to 'https:'
  React.useEffect(() => {
    const token = getToken();

    let ws: WSFactory;
    if (token) {
      if (createSocket) {
        const base64Token = base64(token);

        ws = new WSFactory('sample websocket', {
          host: 'wss://api-toolchain-host-operator.apps.appstudio-stage.x99m.p1.openshiftapps.com:443',
          path: `/apis/appstudio.redhat.com/v1alpha1/namespaces/aballantyne/applications?watch=true`,
          subprotocols: [`base64url.bearer.authorization.k8s.io.${base64Token}`, 'base64.binary.k8s.io'],
        });
        ws.onerror((data) => {
          console.debug('error', data);
        });
        ws.onmessage((dataString) => {
          try {
            const data = JSON.parse(dataString);
            const { type, object } = data || {}; // current structure
            setR(object);
            console.debug('message', type, object);
          } catch (e) {
            console.error('>>> Web Socket Data Bad', e);
            setError('Web Socket data unknown structure');
            return;
          }
        });
        ws.onclose((data) => {
          setR(null);
          setCreateSocket(null);
          // https://www.rfc-editor.org/rfc/rfc6455#section-11.7
          // 1006: https://stackoverflow.com/a/19305172
          console.debug('close', data, 'code:', data.code);
        });
      }
    } else {
      setError('Unknown token');
    }

    return () => {
      ws?.destroy();
      ws = null;
    };
  }, [createSocket]);

  return (
    <>
      <Title headingLevel="h2" size="xl">
        Websockets
      </Title>
      {!createSocket && (
        <Button onClick={() => setCreateSocket(true)} variant="primary">
          Create Socket Connection
        </Button>
      )}
      {createSocket && !r && <Spinner />}
      {error && (
        <Alert variant="danger" title="Websocket Error">
          {error}
        </Alert>
      )}
      {r && <PrintObject object={r} />}
    </>
  );
};

export default WSTest;

/* eslint-disable no-console */
import * as React from 'react';
import { WSFactory } from './ws';
import PrintObject from './PrintObject';
import { Alert, Button, Title } from '@patternfly/react-core';
import WSLoadingState from './WSLoadingState';

const WSTest = () => {
  const [r, setR] = React.useState(null);
  const [createSocket, setCreateSocket] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isOpen, setOpen] = React.useState(false);

  React.useEffect(() => {
    let ws: WSFactory;
    if (createSocket) {
      ws = new WSFactory('sample websocket', {
        path: `/apis/appstudio.redhat.com/v1alpha1/namespaces/aballantyne/applications?watch=true`,
      });
      ws.onOpen(() => {
        setOpen(true);
      });
      ws.onError((data) => {
        console.debug('error', data);
      });
      ws.onMessage((dataStringOrObject) => {
        try {
          let data;
          if (typeof dataStringOrObject === 'string') {
            data = JSON.parse(dataStringOrObject);
          } else {
            data = dataStringOrObject;
          }
          const { type, object } = data || {}; // current structure
          switch (type) {
            case 'DELETED':
              setR(null);
              break;
            default:
              setR(object);
          }
          console.debug('message', type, object);
        } catch (e) {
          console.error('>>> Web Socket Data Bad', e);
          setError('Web Socket data unknown structure');
          return;
        }
      });
      ws.onClose((data) => {
        setOpen(false);
        setR(null);
        setCreateSocket(null);
        // https://www.rfc-editor.org/rfc/rfc6455#section-11.7
        // 1006: https://stackoverflow.com/a/19305172
        console.debug('close', data, 'code:', data.code);
      });
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
      <p>Needs a created Application to successfully return details.</p>
      {!createSocket && (
        <Button onClick={() => setCreateSocket(true)} variant="primary">
          Create Socket Connection
        </Button>
      )}
      <WSLoadingState socketBeingCreated={createSocket} socketOpen={isOpen} resourceLoaded={!!r} />
      {isOpen && !r && <p>No response -- did you create the Application?</p>}
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

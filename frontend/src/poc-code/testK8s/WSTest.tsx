import * as React from 'react';
import { WSFactory } from './ws-factory';
import { K8sTargetWS } from '../../../constants';

type WSTestProps = {};

const WSTest: React.FC<WSTestProps> = () => {
  const ref = React.useRef<WSFactory>(null);

  React.useEffect(() => {
    console.debug('+++++++hook start+++++++');
    const cookieToken = document.cookie.split('; ').find((val) => val.startsWith('cs_jwt='));
    if (!cookieToken) {
      // Promise.reject('Could not make k8s call. Unable to find token.');
      console.error('no token??', typeof cookieToken, cookieToken);
      debugger;
    }
    const [, token] = cookieToken.split('=');

    const base64 = (data) => {
      return btoa(data); // not valid anymore??
    };
    const base64Token = base64(token);

    ref.current = new WSFactory('sample websocket', {
      host: K8sTargetWS,
      path: '/apis/appstudio.redhat.com/v1alpha1/namespaces/aballantyne/applications',
      subprotocols: ['base64.binary.k8s.io', `base64url.bearer.authorization.k8s.io.${base64Token}`],
    });
    ref.current.onerror((data) => {
      console.debug('error', data);
    });
    ref.current.onmessage((data) => {
      console.debug('message', data);
    });
    ref.current.onclose((data) => {
      // https://www.rfc-editor.org/rfc/rfc6455#section-11.7
      console.debug('close', data, data.code, data.reason);
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

    return () => {
      console.debug('------hook unload------');
      ref.current.destroy();
      ref.current = null;
    };
  }, []);

  return <div>Hello World</div>;
};

export default WSTest;

/*
Refused to connect to 'wss://api-toolchain-host-operator.apps.appstudio-stage.x99m.p1.openshiftapps.com/' because it violates the following Content Security Policy directive: "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval' https://*.redhat.com/ https://www.redhat.com  https://*.openshift.com/ https://api.stage.openshift.com/ https://identity.api.openshift.com/ https://www.youtube.com/ https://redhat.sc.omtrdc.net/ https://assets.adobedtm.com https://www.redhat.com https://*.storage.googleapis.com/ https://*.hotjar.com:* https://*.hotjar.io wss://*.hotjar.com". Note that 'connect-src' was not explicitly set, so 'default-src' is used as a fallback.
 */

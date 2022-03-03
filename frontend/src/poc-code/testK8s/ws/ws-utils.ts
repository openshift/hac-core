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

const getUtilsConfig = () => {
  const token = getToken();
  const base64Token = base64(token);

  return {
    wsConfigs: {
      host: K8S_WS_TARGET_URL,
      subProtocols: [`base64url.bearer.authorization.k8s.io.${base64Token}`, 'base64.binary.k8s.io'],
    },
  };
};

export const createURL = (host: string, path: string): string => {
  let url;

  if (host === 'auto') {
    if (window.location.protocol === 'https:') {
      url = 'wss://';
    } else {
      url = 'ws://';
    }
    url += window.location.host;
  } else {
    url = host;
  }

  if (path) {
    url += path;
  }

  return url;
};

export const applyConfigHost = (overrideHost?: string): string => {
  return overrideHost ?? getUtilsConfig().wsConfigs.host;
};

export const applyConfigSubProtocols = (overridableProtocols?: string[]): string[] => {
  return overridableProtocols ?? getUtilsConfig().wsConfigs.subProtocols;
};

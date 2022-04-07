const base64 = (data: string): string => {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').split('=', 1)[0];
};

export const getWSTokenSubProtocols = (token: string): string[] => {
  const base64Token = base64(token);
  return [`base64url.bearer.authorization.k8s.io.${base64Token}`, 'base64.binary.k8s.io'];
};

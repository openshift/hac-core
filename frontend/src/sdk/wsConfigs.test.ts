import { getWSTokenSubProtocols } from './wsConfigs';

test('should properly get WS subprotocols', () => {
  const result = getWSTokenSubProtocols('some');
  expect(result).toMatchObject(['base64url.bearer.authorization.k8s.io.c29tZQ', 'base64.binary.k8s.io']);
});

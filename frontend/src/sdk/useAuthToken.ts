import * as React from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const useAuthToken = (): string | undefined => {
  const { auth } = useChrome();
  const [token, setToken] = React.useState<string>();

  React.useEffect(() => {
    auth.getToken().then((t: string) => {
      setToken(t);
    });
  }, [auth]);

  return token;
};

export default useAuthToken;

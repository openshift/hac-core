import * as React from 'react';

type ProviderWrapperProps = {
  provider: React.Provider<unknown>;
  useValueHook: () => unknown;
  children?: React.ReactNode;
};

const ProviderWrapper: React.FC<ProviderWrapperProps> = ({ provider: Provider, useValueHook, children }) => {
  const value = useValueHook();
  return <Provider value={value}>{children}</Provider>;
};

export default React.memo(ProviderWrapper);

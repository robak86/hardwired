import * as React from 'react';

const DummyContext = React.createContext(123);

export const DummyProvider: React.FC<{ value: number } & React.PropsWithChildren> = ({ children, value }) => {
  return <DummyContext.Provider value={value}>{children}</DummyContext.Provider>;
};

export const useDummyProviderValue = () => {
  return React.useContext(DummyContext);
};

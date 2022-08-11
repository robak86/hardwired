import React, { FunctionComponent, PropsWithChildren, useContext } from 'react';

const DummyContext = React.createContext(123);

export const DummyProvider: FunctionComponent<{ value: number } & PropsWithChildren> = ({ children, value }) => {
  return <DummyContext.Provider value={value}>{children}</DummyContext.Provider>;
};

export const useDummyProviderValue = () => {
  return useContext(DummyContext);
};

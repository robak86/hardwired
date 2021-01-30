import React, { FunctionComponent, useContext } from 'react';

const DummyContext = React.createContext(123);

export const DummyProvider: FunctionComponent<{ value: number }> = ({ children, value }) => {
  return <DummyContext.Provider value={value}>{children}</DummyContext.Provider>;
};

export const useDummyProviderValue = () => {
  return useContext(DummyContext);
};

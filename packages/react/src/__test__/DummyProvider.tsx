import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

const DummyContext = createContext(123);

export const DummyProvider: FC<{ value: number } & PropsWithChildren> = ({ children, value }) => {
  return <DummyContext.Provider value={value}>{children}</DummyContext.Provider>;
};

export const useDummyProviderValue = () => {
  return useContext(DummyContext);
};

import { FunctionComponent, useMemo } from 'react';
import { container, Module } from 'hardwired';
import * as React from 'react';
import { ContainerContext } from './ContainerContext';

// TODO: should print warning that transient/request resolvers are not supported ?
// Maybe react package should provide it's own container implementation ?
export const Container: FunctionComponent = ({ children }) => {
  const containerInstance = useMemo(() => container(Module.empty('root')), []);

  return <ContainerContext.Provider value={{ container: containerInstance }}>{children}</ContainerContext.Provider>;
};

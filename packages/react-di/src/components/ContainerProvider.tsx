import * as React from "react";
import { FunctionComponent, useMemo } from "react";
import { Container } from "hardwired";
import { ContainerContext } from "./ContainerContext";

// TODO: should print warning that transient/request resolvers are not supported ?
// Maybe react package should provide it's own container implementation ?

export type ContainerProviderProps = {
  container: Container<any>;
};

export const ContainerProvider: FunctionComponent<ContainerProviderProps> = ({ children, container }) => {
  const containerInstance = useMemo(() => container, []);

  return <ContainerContext.Provider value={{ container: containerInstance }}>{children}</ContainerContext.Provider>;
};

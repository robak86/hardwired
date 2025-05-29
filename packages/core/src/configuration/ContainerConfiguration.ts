import type { IContainerConfigurable } from './abstract/IContainerConfigurable.js';

export type ContainerConfigureFn = (container: IContainerConfigurable) => void;

export const configureContainer = <T extends ContainerConfigureFn>(configureFn: T): T => {
  return configureFn;
};

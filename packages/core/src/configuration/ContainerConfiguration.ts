import { InstanceCreationAware, UseFn } from '../container/IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { ContainerConfigurable } from './abstract/ContainerConfigurable.js';

export type ContainerConfigureFn = (container: ContainerConfigurable) => void;
export type AsyncContainerConfigureFn = (container: ContainerConfigurable) => Promise<void>;

export const configureContainer = <T extends ContainerConfigureFn | AsyncContainerConfigureFn>(configureFn: T): T => {
  return configureFn;
};

export type ConfigurationContainer = InstanceCreationAware & UseFn<LifeTime>;

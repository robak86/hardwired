import type { InstanceCreationAware, UseFn } from '../container/IContainer.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';

import type { IContainerConfigurable } from './abstract/IContainerConfigurable.js';

export type ContainerConfigureFn = (container: IContainerConfigurable) => void;
export type AsyncContainerConfigureFn = (container: IContainerConfigurable) => Promise<void>;

export const configureContainer = <T extends ContainerConfigureFn | AsyncContainerConfigureFn>(configureFn: T): T => {
  return configureFn;
};

export type ConfigurationContainer = InstanceCreationAware & UseFn<LifeTime>;

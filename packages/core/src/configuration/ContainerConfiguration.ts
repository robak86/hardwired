import { InstanceCreationAware, UseFn } from '../container/IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { ContainerConfigurable } from './abstract/ContainerConfigurable.js';

export type ContainerConfigureFn = (container: ContainerConfigurable) => void;

export const configureContainer = (configureFn: ContainerConfigureFn): ContainerConfigureFn => {
  return configureFn;
};

export type ConfigurationContainer = InstanceCreationAware & UseFn<LifeTime>;

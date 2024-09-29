import { InstanceCreationAware, UseFn } from '../container/IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { ContainerConfigurable } from './abstract/ContainerConfigurable.js';
import { ContainerConfigurationDSL } from './dsl/ContainerConfigurationDSL.js';

export class ContainerConfiguration {
  constructor(public readonly _configure: (container: ContainerConfigurable) => void) {}

  apply() {
    const binder = new ContainerConfigurationDSL();
    this._configure(binder);
    return binder;
  }
}

export type ContainerConfigureCallback = (container: ContainerConfigurable) => void;

export const configureContainer = (configureFn: (container: ContainerConfigurable) => void): ContainerConfiguration => {
  return new ContainerConfiguration(configureFn);
};

export type ConfigurationContainer = InstanceCreationAware & UseFn<LifeTime>;

import { InstanceCreationAware, UseFn } from './IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { ContainerConfigureAware, ContainerConfigureBinder } from '../definitions/ContainerConfigureAware.js';
import { ScopeConfigureAware, ScopeConfigureBinder } from '../definitions/ScopeConfigureAware.js';

export class ContainerConfiguration {
  constructor(public readonly _configure: (container: ContainerConfigureAware) => void) {}

  apply() {
    const binder = new ContainerConfigureBinder();
    this._configure(binder);
    return binder;
  }
}

export class ScopeConfiguration {
  constructor(private readonly _configure: (scope: ScopeConfigureAware, parent: ParentContainer) => void) {}

  apply(parent: ParentContainer): ScopeConfigureBinder {
    const binder = new ScopeConfigureBinder();
    this._configure(binder, parent);
    return binder;
  }
}

export type ContainerConfigureCallback = (container: ContainerConfigureAware) => void;

export type ScopeConfigureCallback = (scope: ScopeConfigureAware, parent: ParentContainer) => void;

export const configureContainer = (
  configureFn: (container: ContainerConfigureAware) => void,
): ContainerConfiguration => {
  return new ContainerConfiguration(configureFn);
};

export type ParentContainer = InstanceCreationAware & UseFn<LifeTime>;

export const configureScope = (
  configureFn: (scope: ScopeConfigureAware, parentContainer: ParentContainer) => void,
): ScopeConfiguration => {
  return new ScopeConfiguration(configureFn);
};

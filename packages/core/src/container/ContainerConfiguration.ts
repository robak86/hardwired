import { InstanceCreationAware, UseFn } from './IContainer.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

import { ContainerConfigureAware } from '../definitions/ContainerConfigureAware.js';
import { ScopeConfigureAware } from '../definitions/ScopeConfigureAware.js';

export class ContainerConfiguration {
  constructor(public readonly apply: (container: ContainerConfigureAware) => void) {}
}

export class ScopeConfiguration {
  constructor(public readonly apply: (scope: ScopeConfigureAware, parent: ParentContainer) => void) {}
}

export type ContainerConfigureCallback = (container: ContainerConfigureAware) => void;

export type ScopeConfigureCallback = (scope: ScopeConfigureAware, parent: ParentContainer) => void;

export const configureContainer = (
  configureFn: (container: ContainerConfigureAware) => void,
): ContainerConfiguration => {
  return new ContainerConfiguration(configureFn);
};

type ParentContainer = InstanceCreationAware & UseFn<LifeTime>;

export const configureScope = (
  configureFn: (scope: ScopeConfigureAware, parentContainer: ParentContainer) => void,
): ScopeConfiguration => {
  return new ScopeConfiguration(configureFn);
};

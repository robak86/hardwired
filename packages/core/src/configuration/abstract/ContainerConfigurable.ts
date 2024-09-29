import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { Definition } from '../../definitions/abstract/Definition.js';
import { Binder } from '../../definitions/Binder.js';
import { ContainerConfiguration, ContainerConfigureCallback } from '../ContainerConfiguration.js';
import { ScopeOptions } from '../../container/Container.js';
import { UseFn } from '../../container/IContainer.js';
import { ContainerConfigurationDSL } from '../dsl/ContainerConfigurationDSL.js';

export const emptyContainerOptions: ScopeOptions = Object.freeze({
  scopeDefinitions: Object.freeze([]),
  frozenDefinitions: Object.freeze([]),
  initializers: Object.freeze([]),
});

export type ContainerConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;

export type ContainerConfigurator = ContainerConfigureCallback | ContainerConfiguration;

export type InitFn = (container: UseFn<any>) => void;

export function containerConfiguratorToOptions(optionsOrFunction?: ContainerConfigurator): ScopeOptions {
  if (optionsOrFunction instanceof Function) {
    const binder = new ContainerConfigurationDSL();
    optionsOrFunction(binder);

    return binder;
  } else if (optionsOrFunction instanceof ContainerConfiguration) {
    return optionsOrFunction.apply();
  } else {
    return emptyContainerOptions;
  }
}

export interface ContainerConfigurable {
  bind<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Omit<Binder<TInstance, TLifeTime, TArgs>, 'toInheritedFrom'>;

  freeze<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Omit<Binder<TInstance, TLifeTime, TArgs>, 'toInheritedFrom'>;

  init(initializer: InitFn): void;
}

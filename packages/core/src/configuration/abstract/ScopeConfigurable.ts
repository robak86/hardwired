import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { Binder } from '../../definitions/Binder.js';
import { ScopeOptions } from '../../container/Container.js';

import { emptyContainerOptions, InitFn } from './ContainerConfigurable.js';
import { IContainer } from '../../container/IContainer.js';
import { ScopeConfiguration, ScopeConfigureCallback } from '../ScopeConfiguration.js';
import { ScopeConfigurationDSL } from '../dsl/ScopeConfigurationDSL.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export type ContainerConfigurator = ScopeConfigureCallback | ScopeConfiguration;

export function scopeConfiguratorToOptions(
  optionsOrFunction: ContainerConfigurator | undefined,
  parentContainer: IContainer,
): ScopeOptions {
  if (optionsOrFunction instanceof Function) {
    const binder = new ScopeConfigurationDSL(parentContainer);

    optionsOrFunction(binder, parentContainer);
    return binder;
  } else if (optionsOrFunction instanceof ScopeConfiguration) {
    return optionsOrFunction.apply(parentContainer);
  } else {
    return emptyContainerOptions;
  }
}

export interface ScopeConfigurable {
  bindLocal<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;

  onInit(initializer: InitFn): void;

  // TODO: add to container configuration
  bindCascading<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped, []>,
  ): Binder<TInstance, LifeTime.scoped, []>;

  cascade<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void;
}

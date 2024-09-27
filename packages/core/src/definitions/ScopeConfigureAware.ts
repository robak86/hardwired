import { Definition } from './abstract/Definition.js';
import { LifeTime } from './abstract/LifeTime.js';
import { Binder } from './Binder.js';
import { ScopeOptions } from '../container/Container.js';
import { ScopeConfiguration, ScopeConfigureCallback } from '../container/ContainerConfiguration.js';
import { IContainer } from '../container/IContainer.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export type ContainerConfigurator = ScopeOptions | ScopeConfigureCallback | ScopeConfiguration;

export function scopeConfiguratorToOptions(
  optionsOrFunction: ContainerConfigurator,
  parentContainer: IContainer,
): ScopeOptions {
  if (optionsOrFunction instanceof Function) {
    const binder = new ScopeConfigureBinder();
    optionsOrFunction(binder, parentContainer);

    return {
      scope: binder.scopeDefinitions,
      final: [],
    };
  } else if (optionsOrFunction instanceof ScopeConfiguration) {
    const binder = new ScopeConfigureBinder();
    optionsOrFunction.apply(binder, parentContainer);

    return {
      scope: binder.scopeDefinitions,
      final: [],
    };
  } else {
    return optionsOrFunction ?? {};
  }
}

export interface ScopeConfigureAware {
  bind<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;
}

export class ScopeConfigureBinder implements ScopeConfigureAware {
  private _scopeDefinitions: Definition<any, any, any>[] = [];

  constructor() {}

  bind<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    return new Binder(definition, this._scopeDefinitions);
  }

  get scopeDefinitions() {
    return this._scopeDefinitions;
  }
}

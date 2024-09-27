import { LifeTime } from './abstract/LifeTime.js';
import { Definition } from './abstract/Definition.js';
import { Binder } from './Binder.js';
import { ContainerConfiguration, ContainerConfigureCallback } from '../container/ContainerConfiguration.js';
import { ScopeOptions } from '../container/Container.js';

export type ContainerConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;

export type ContainerConfigurator = ScopeOptions | ContainerConfigureCallback | ContainerConfiguration;

export function containerConfiguratorToOptions(optionsOrFunction?: ContainerConfigurator): ScopeOptions {
  if (optionsOrFunction instanceof Function) {
    const binder = new ContainerConfigureBinder();
    optionsOrFunction(binder);

    return {
      scope: binder.scopeDefinitions,
      final: binder.frozenDefinitions,
    };
  } else if (optionsOrFunction instanceof ContainerConfiguration) {
    const binder = new ContainerConfigureBinder();
    optionsOrFunction.apply(binder);

    return {
      scope: binder.scopeDefinitions,
      final: binder.frozenDefinitions,
    };
  } else {
    return optionsOrFunction ?? {};
  }
}

export interface ContainerConfigureAware {
  bind<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;

  freeze<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;
}

export class ContainerConfigureBinder implements ContainerConfigureAware {
  private _scopeDefinitions: Definition<any, any, any>[] = [];
  private _frozenDefinitions: Definition<any, any, any>[] = [];

  constructor() {}

  bind<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    return new Binder(definition, this._scopeDefinitions);
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    return new Binder(definition, this._frozenDefinitions);
  }

  get scopeDefinitions() {
    return this._scopeDefinitions;
  }

  get frozenDefinitions() {
    return this._frozenDefinitions;
  }
}

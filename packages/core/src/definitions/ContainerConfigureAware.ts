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

    return binder;
  } else if (optionsOrFunction instanceof ContainerConfiguration) {
    const binder = new ContainerConfigureBinder();
    optionsOrFunction.apply(binder);

    return binder;
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

export class ContainerConfigureBinder implements ContainerConfigureAware, ScopeOptions {
  private _scopeDefinitions: Definition<any, any, any>[] = [];
  private _frozenDefinitions: Definition<any, any, any>[] = [];

  private _scopeDefinitionsById: Record<string, true> = {};
  private _frozenDefinitionsById: Record<string, true> = {};

  constructor() {}

  bind<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if (this._scopeDefinitionsById[definition.id]) {
      throw new Error(`Definition with id ${definition.id} is already bounded.`);
    } else {
      this._scopeDefinitionsById[definition.id] = true;
    }

    return new Binder(definition, this._scopeDefinitions);
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if (this._frozenDefinitionsById[definition.id]) {
      throw new Error(`Definition with id ${definition.id} is already frozen.`);
    } else {
      this._frozenDefinitionsById[definition.id] = true;
    }

    return new Binder(definition, this._frozenDefinitions);
  }

  get scopeDefinitions() {
    return this._scopeDefinitions;
  }

  get frozenDefinitions() {
    return this._frozenDefinitions;
  }
}

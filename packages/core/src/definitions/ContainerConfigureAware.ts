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
    return optionsOrFunction.apply();
  } else {
    return optionsOrFunction ?? {};
  }
}

export interface ContainerConfigureAware {
  bind<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Omit<Binder<TInstance, TLifeTime, TArgs>, 'toInheritedFrom'>;

  freeze<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Omit<Binder<TInstance, TLifeTime, TArgs>, 'toInheritedFrom'>;
}

export class ContainerConfigureBinder implements ContainerConfigureAware, ScopeOptions {
  private _scopeDefinitions: Definition<any, any, any>[] = [];
  private _frozenDefinitions: Definition<any, any, any>[] = [];

  private _scopeDefinitionsById: Map<symbol, true> = new Map();
  private _frozenDefinitionsById: Map<symbol, true> = new Map();

  constructor() {}

  bind<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if (this._scopeDefinitionsById.has(definition.id)) {
      throw new Error(`Definition is already bounded.`);
    } else {
      this._scopeDefinitionsById.set(definition.id, true);
    }

    return new Binder(definition, this._scopeDefinitions);
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if (this._frozenDefinitionsById.has(definition.id)) {
      throw new Error(`Definition is already frozen.`);
    } else {
      this._frozenDefinitionsById.set(definition.id, true);
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

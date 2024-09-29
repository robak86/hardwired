import { ScopeOptions } from '../../container/Container.js';
import { Definition } from '../../definitions/abstract/Definition.js';
import { Binder } from '../../definitions/Binder.js';
import {
  ContainerConfigurable,
  ContainerConfigureAllowedLifeTimes,
  InitFn,
} from '../abstract/ContainerConfigurable.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';

export class ContainerConfigurationDSL implements ContainerConfigurable, ScopeOptions {
  private _scopeDefinitions: Definition<any, any, any>[] = [];
  private _frozenDefinitions: Definition<any, any, any>[] = [];
  private _initializers: InitFn[] = [];

  private _scopeDefinitionsById: Map<symbol, true> = new Map();
  private _frozenDefinitionsById: Map<symbol, true> = new Map();

  readonly cascadingDefinitions: Definition<any, LifeTime.singleton, []>[] = [];

  constructor() {}

  init(initializer: InitFn): void {
    this._initializers.push(initializer);
  }

  bind<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if (this._scopeDefinitionsById.has(definition.id)) {
      throw new Error(`Definition is already bounded.`);
    } else {
      this._scopeDefinitionsById.set(definition.id, true);
    }

    return new Binder(definition, this._scopeDefinitions, null);
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if (this._frozenDefinitionsById.has(definition.id)) {
      throw new Error(`Definition is already frozen.`);
    } else {
      this._frozenDefinitionsById.set(definition.id, true);
    }

    return new Binder(definition, this._frozenDefinitions, null);
  }

  get scopeDefinitions() {
    return this._scopeDefinitions;
  }

  get frozenDefinitions() {
    return this._frozenDefinitions;
  }

  get initializers() {
    return this._initializers;
  }
}

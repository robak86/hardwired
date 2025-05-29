import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import { isDefinition } from '../definitions/abstract/IDefinition.js';
import type { IDefinitionToken } from '../definitions/tokens.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { IBindingsRegistryConfiguration } from '../configuration/dsl/new/container/ContainerConfiguration.js';
import type { ILazyDefinitionBuilder } from '../configuration/dsl/new/utils/abstract/ILazyDefinitionBuilder.js';

import type { IReadonlyScopeRegistry } from './ScopeRegistry.js';
import { ScopeRegistry } from './ScopeRegistry.js';
import type { IBindingsRegistryRead } from './abstract/IBindingsRegistryRead.js';
import { LazyDefinitionsRegistry } from './LazyDefinitionsRegistry.js';

export class BindingsRegistry implements IBindingsRegistryRead {
  static create(configs: IBindingsRegistryConfiguration[]): BindingsRegistry {
    const definitions = ScopeRegistry.root(configs.map(c => c.definitions));
    const frozenDefinitions = ScopeRegistry.root(configs.map(c => c.frozenDefinitions));
    const lazyDefinitions = LazyDefinitionsRegistry.root(configs.map(c => c.lazyDefinitions));

    return new BindingsRegistry(frozenDefinitions, definitions, lazyDefinitions);
  }

  constructor(
    private _frozenDefinitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
    private _definitions: IReadonlyScopeRegistry<IDefinition<unknown, LifeTime>>,
    private _lazyDefinitions: LazyDefinitionsRegistry,
  ) {}

  checkoutForScope(configs: IBindingsRegistryConfiguration[]): BindingsRegistry {
    return new BindingsRegistry(
      this._frozenDefinitions.checkoutScope(configs.map(c => c.frozenDefinitions)),
      this._definitions.checkoutScope(configs.map(c => c.definitions)),
      this._lazyDefinitions.checkoutScope(configs.map(c => c.lazyDefinitions)),
    );
  }

  findForDefinition<TInstance, TLifeTime extends LifeTime>(
    definition: IDefinition<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    const overriddenDefinition = this.findByToken(definition);

    if (overriddenDefinition) {
      return overriddenDefinition;
    }

    // we didnt' find any .add() definition that will override definition,
    // but we still might have a lazy definitions

    if (this._lazyDefinitions.has(definition.id)) {
      return this._lazyDefinitions.apply(definition);
    }

    return definition;
  }

  findByToken<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> | undefined {
    const definition =
      (this._frozenDefinitions.find(token.id) as IDefinition<TInstance, TLifeTime>) ??
      (this._definitions.find(token.id) as IDefinition<TInstance, TLifeTime>);

    if (definition && this._lazyDefinitions.has(token.id)) {
      return this._lazyDefinitions.apply(definition);
    }

    if (!definition && isDefinition(token)) {
      return this._lazyDefinitions.apply(token);
    }

    return definition;
  }

  hasLazyDefinition<TInstance, TLifeTime extends LifeTime>(token: IDefinitionToken<TInstance, TLifeTime>): boolean {
    return this._lazyDefinitions.has(token.id);
  }

  getByToken<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    const definition = this.findByToken(token);

    if (!definition) {
      throw new Error(`Cannot find definition for ${token.toString()}. Make sure the definition symbol is registered.`);
    }

    return definition;
  }

  hasFrozenBinding(definitionId: symbol): boolean {
    return this._frozenDefinitions.has(definitionId);
  }

  freeze<TInstance, TLifetime extends LifeTime>(def: IDefinition<TInstance, TLifetime>) {
    if (this._frozenDefinitions.has(def.id)) {
      throw new Error(`Final binding was already set. Cannot override it.`);
    }

    this._frozenDefinitions.register(def.id, def);
  }

  appendLazyDefinition(_definition: ILazyDefinitionBuilder<unknown, LifeTime>) {
    this._lazyDefinitions.append(_definition);
  }
}

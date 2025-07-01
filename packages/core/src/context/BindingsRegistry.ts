import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import { isDefinition } from '../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { IDefinitionsRegistryConfiguration } from '../configuration/dsl/new/container/ContainerConfiguration.js';
import type { IDefinitionTransform } from '../configuration/dsl/new/utils/abstract/IDefinitionTransform.js';
import type { IDefinitionToken } from '../definitions/DefinitionToken.js';

import { ScopeRegistry } from './ScopeRegistry.js';
import type { IBindingsRegistryRead } from './abstract/IBindingsRegistryRead.js';
import { DefinitionsTransformsRegistry } from './DefinitionsTransformsRegistry.js';

// TODO: rename to DefinitionsRegistry
export class BindingsRegistry implements IBindingsRegistryRead {
  static create(configs: IDefinitionsRegistryConfiguration[]): BindingsRegistry {
    const definitions = ScopeRegistry.root(configs.map(c => c.definitions));
    const shadowingDefinitions = ScopeRegistry.empty<IDefinition<unknown, LifeTime>>();
    const frozenDefinitions = ScopeRegistry.root(configs.map(c => c.frozenDefinitions));
    const lazyDefinitions = DefinitionsTransformsRegistry.root(configs.map(c => c.definitionsTransforms));

    return new BindingsRegistry(frozenDefinitions, definitions, lazyDefinitions, shadowingDefinitions);
  }

  constructor(
    private _frozenDefinitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
    private _definitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
    private _definitionTransforms: DefinitionsTransformsRegistry,
    private _shadowingDefinitions: ScopeRegistry<IDefinition<unknown, LifeTime>>,
  ) {}

  hasOwnDefinition(definitionId: symbol): boolean {
    return this._definitions.hasOwn(definitionId);
  }

  setShadowingDefinition(definitionId: symbol, definition: IDefinition<unknown, LifeTime>): void {
    this._shadowingDefinitions.append(definitionId, definition);
  }

  checkoutForScope(configs: IDefinitionsRegistryConfiguration[]): BindingsRegistry {
    return new BindingsRegistry(
      this._frozenDefinitions.checkoutScope(configs.map(c => c.frozenDefinitions)),
      this._definitions.checkoutScope(configs.map(c => c.definitions)),
      this._definitionTransforms.checkoutScope(configs.map(c => c.definitionsTransforms)),
      this._shadowingDefinitions.checkoutScope([]),
    );
  }

  findForDefinition<TInstance, TLifeTime extends LifeTime>(
    definition: IDefinition<TInstance, TLifeTime>,
    skipShadowingDefinitions = false,
  ): IDefinition<TInstance, TLifeTime> {
    const overriddenDefinition = this.findByToken(definition, skipShadowingDefinitions);

    if (overriddenDefinition) {
      return overriddenDefinition;
    }

    // we didnt' find any .add() definition that will override definition,
    // but we still might have a lazy definitions

    if (this._definitionTransforms.has(definition.id)) {
      return this._definitionTransforms.apply(definition);
    }

    return definition;
  }

  // TODO: Reorganize. If we find a frozen definition, there's no reason to look for a lazy one.
  // TODO: Or is there?
  findByToken<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
    skipShadowingDefinitions = false,
  ): IDefinition<TInstance, TLifeTime> | undefined {
    const definition =
      (this._frozenDefinitions.find(token.id) as IDefinition<TInstance, TLifeTime>) ??
      (skipShadowingDefinitions
        ? null
        : (this._shadowingDefinitions.find(token.id) as IDefinition<TInstance, TLifeTime>)) ??
      (this._definitions.find(token.id) as IDefinition<TInstance, TLifeTime>);

    if (definition && this._definitionTransforms.has(token.id)) {
      return this._definitionTransforms.apply(definition);
    }

    if (!definition && isDefinition(token)) {
      return this._definitionTransforms.apply(token);
    }

    return definition;
  }

  hasDefinitionTransform<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): boolean {
    return this._definitionTransforms.has(token.id);
  }

  getByToken<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
    skipShadowingDefinitions = false,
  ): IDefinition<TInstance, TLifeTime> {
    const definition = this.findByToken(token, skipShadowingDefinitions);

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

  appendDefinitionTransform(_definition: IDefinitionTransform<unknown, LifeTime>) {
    this._definitionTransforms.append(_definition);
  }
}

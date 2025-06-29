import type { IDefinitionsRegistryConfiguration } from '../configuration/dsl/new/container/ContainerConfiguration.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { IDefinitionToken } from '../definitions/DefinitionToken.js';

import { ScopeRegistry } from './ScopeRegistry.js';
import type { IBindingsRegistryRead } from './abstract/IBindingsRegistryRead.js';

export class InheritedBindingsRegistry implements IBindingsRegistryRead {
  static create(configs: IDefinitionsRegistryConfiguration[]): InheritedBindingsRegistry {
    const definitions = ScopeRegistry.root(configs.map(c => c.definitions));

    return new InheritedBindingsRegistry(definitions);
  }

  constructor(private _definitions: ScopeRegistry<IDefinition<unknown, LifeTime>>) {}

  hasOwnDefinition(definitionId: symbol): boolean {
    return this._definitions.hasOwn(definitionId);
  }

  setDefinition(definitionId: symbol, definition: IDefinition<unknown, LifeTime>): void {
    this._definitions.append(definitionId, definition);
  }

  checkoutForScope(configs: IDefinitionsRegistryConfiguration[]): InheritedBindingsRegistry {
    return new InheritedBindingsRegistry(this._definitions.checkoutScope(configs.map(c => c.definitions)));
  }

  findForDefinition<TInstance, TLifeTime extends LifeTime>(
    definition: IDefinition<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> {
    const overriddenDefinition = this.findByToken(definition);

    if (overriddenDefinition) {
      return overriddenDefinition;
    }

    return definition;
  }

  findByToken<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> | undefined {
    const definition = this._definitions.find(token.id) as IDefinition<TInstance, TLifeTime>;

    return definition;
  }

  findByTokenAndLifeTime<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): IDefinition<TInstance, TLifeTime> | undefined {
    const definition = this.findByToken(token);

    if (definition && definition.strategy === token.strategy) {
      return definition;
    }

    return undefined;
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
}

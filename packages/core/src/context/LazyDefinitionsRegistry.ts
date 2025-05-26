import type { ILazyDefinitionBuilder } from '../configuration/dsl/new/utils/abstract/ILazyDefinitionBuilder.js';
import type { LifeTime } from '../definitions/abstract/LifeTime.js';

export class LazyDefinitionsRegistry {
  private _lazyDefinitions = new Map<symbol, ILazyDefinitionBuilder<unknown, LifeTime>[]>();
  private _frozenLazyDefinitions = new Map<symbol, ILazyDefinitionBuilder<unknown, LifeTime>[]>();

  append(lazyDefinition: ILazyDefinitionBuilder<unknown, LifeTime>) {
    if (!this._lazyDefinitions.has(lazyDefinition.token.id)) {
      this._lazyDefinitions.set(lazyDefinition.token.id, []);
    }

    this._lazyDefinitions.get(lazyDefinition.token.id)!.push(lazyDefinition);
  }

  appendFrozen(lazyDefinition: ILazyDefinitionBuilder<unknown, LifeTime>) {
    if (!this._frozenLazyDefinitions.has(lazyDefinition.token.id)) {
      this._frozenLazyDefinitions.set(lazyDefinition.token.id, []);
    }

    this._frozenLazyDefinitions.get(lazyDefinition.token.id)!.push(lazyDefinition);
  }
}

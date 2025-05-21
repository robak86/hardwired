import type { MaybePromise } from '../../../../utils/async.js';
import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import { createConfiguredDefinition } from '../utils/create-configured-definition.js';
import { createDecoratedDefinition } from '../utils/create-decorated-definition.js';
import { Definition } from '../../../../definitions/impl/Definition.js';
import type { IContainer } from '../../../../container/IContainer.js';

export class OwningDefinitionBuilder<TInstance, TLifeTime extends LifeTime> {
  constructor(
    private definitionSymbol: IDefinitionSymbol<TInstance, TLifeTime>,
    private _registry: BindingsRegistry,
  ) {}

  configure(configFn: (instance: TInstance) => MaybePromise<void>) {
    const configuredDefinition = createConfiguredDefinition(this._registry, this.definitionSymbol, configFn, []);

    this._registry.override(configuredDefinition);
  }

  decorate(decorateFn: (instance: TInstance) => MaybePromise<TInstance>) {
    const decoratedDefinition = createDecoratedDefinition(this._registry, this.definitionSymbol, decorateFn, []);

    this._registry.override(decoratedDefinition);
  }

  inherit(decorateFn: (instance: TInstance) => MaybePromise<TInstance>) {
    throw new Error('Implement me!');
  }

  static(value: TInstance) {
    const definition = new Definition(this.definitionSymbol.id, this.definitionSymbol.strategy, () => value);

    this._registry.override(definition);
  }

  redefine(fn: (container: IContainer) => MaybePromise<TInstance>) {
    const definition = new Definition(this.definitionSymbol.id, this.definitionSymbol.strategy, fn);

    this._registry.override(definition);
  }
}

import type { IDefinitionSymbol } from '../../../definitions/def-symbol.js';
import type { MaybePromise } from '../../../utils/async.js';
import type { BindingsRegistry } from '../../../context/BindingsRegistry.js';
import type { LifeTime } from '../../../definitions/abstract/LifeTime.js';

import { createConfiguredDefinition } from './create-configured-definition.js';
import { createDecoratedDefinition } from './create-decorated-definition.js';

export class OwningDefinitionBuilder<TInstance, TLifeTime extends LifeTime> {
  constructor(
    private definitionSymbol: IDefinitionSymbol<TInstance, TLifeTime>,
    private _registry: BindingsRegistry,
  ) {}

  configure(configFn: (instance: TInstance) => MaybePromise<void>) {
    const configuredDefinition = createConfiguredDefinition(this._registry, this.definitionSymbol, configFn);

    this._registry.override(configuredDefinition);
  }

  decorate<TInstance>(decorateFn: (instance: TInstance) => MaybePromise<TInstance>) {
    const decoratedDefinition = createDecoratedDefinition(this._registry, this.definitionSymbol, decorateFn);

    this._registry.override(decoratedDefinition);
  }
}

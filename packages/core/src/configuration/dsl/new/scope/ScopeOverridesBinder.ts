import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { createConfiguredDefinition } from '../utils/create-configured-definition.js';
import { createDecoratedDefinition } from '../utils/create-decorated-definition.js';

import { ScopeSymbolBinder } from './ScopeSymbolBinder.js';

export class ScopeOverridesBinder<TInstance, TLifeTime extends LifeTime> extends ScopeSymbolBinder<
  TInstance,
  TLifeTime
> {
  configure(configFn: (instance: TInstance) => MaybePromise<void>) {
    const configuredDefinition = createConfiguredDefinition(this._registry, this._defSymbol, configFn);

    this._onDefinition(configuredDefinition);
  }

  decorate<TInstance>(decorateFn: (instance: TInstance) => MaybePromise<TInstance>) {
    const decoratedDefinition = createDecoratedDefinition(this._registry, this._defSymbol, decorateFn);

    this._onDefinition(decoratedDefinition);
  }
}

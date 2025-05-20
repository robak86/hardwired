import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { createConfiguredDefinition } from '../utils/create-configured-definition.js';
import { createDecoratedDefinition } from '../utils/create-decorated-definition.js';
import type { ConstructorArgsSymbols } from '../ContainerSymbolBinder.js';

import { ScopeSymbolBinder } from './ScopeSymbolBinder.js';

export class ScopeOverridesBinder<TInstance, TLifeTime extends LifeTime> extends ScopeSymbolBinder<
  TInstance,
  TLifeTime
> {
  configure(configFn: (instance: TInstance) => MaybePromise<void>) {
    const configuredDefinition = createConfiguredDefinition(this._registry, this._defSymbol, configFn);

    this._onDefinition(configuredDefinition);
  }

  decorate<TArgs extends any[]>(
    decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
    ...dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>
  ) {
    const decoratedDefinition = createDecoratedDefinition(this._registry, this._defSymbol, decorateFn, dependencies);

    this._onDefinition(decoratedDefinition);
  }
}

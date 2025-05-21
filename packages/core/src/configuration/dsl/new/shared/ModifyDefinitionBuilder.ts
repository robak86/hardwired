import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { createConfiguredDefinition } from '../utils/create-configured-definition.js';
import { createDecoratedDefinition } from '../utils/create-decorated-definition.js';
import type { IModifyBuilder } from '../../../abstract/IModifyAware.js';

import type { ConstructorArgsSymbols } from './AddDefinitionBuilder.js';
import { AddDefinitionBuilder } from './AddDefinitionBuilder.js';

// TODO: we need to constraint allowed types that can be injected to configure and decorate functions
export class ModifyDefinitionBuilder<TInstance, TLifeTime extends LifeTime>
  extends AddDefinitionBuilder<TInstance, TLifeTime>
  implements IModifyBuilder<TInstance, TLifeTime>
{
  configure<TArgs extends any[]>(configureFn: (instance: TInstance, ...args: TArgs) => MaybePromise<void>): void;
  configure<TArgs extends any[]>(
    dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>,
    configureFn: (instance: TInstance, ...args: TArgs) => MaybePromise<void>,
  ): void;
  configure<TArgs extends any[]>(
    dependencies:
      | ConstructorArgsSymbols<TArgs, TLifeTime>
      | ((instance: TInstance, ...args: TArgs) => MaybePromise<void>),
    configureFn?: (instance: TInstance, ...args: TArgs) => MaybePromise<void>,
  ) {
    if (configureFn && Array.isArray(dependencies)) {
      const configuredDefinition = createConfiguredDefinition(
        this._registry,
        this._defSymbol,
        configureFn,
        dependencies,
      );

      this._onDefinition(configuredDefinition);

      return;
    }

    if (typeof dependencies === 'function') {
      const configuredDefinition = createConfiguredDefinition(
        this._registry,
        this._defSymbol,
        dependencies,
        [] as ConstructorArgsSymbols<TArgs, TLifeTime>,
      );

      this._onDefinition(configuredDefinition);

      return;
    }

    throw new Error('Invalid params');
  }

  decorate<TArgs extends any[]>(decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>): void;
  decorate<TArgs extends any[]>(
    dependencies: ConstructorArgsSymbols<TArgs, TLifeTime>,
    decorateFn: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  ): void;
  decorate<TArgs extends any[]>(
    dependencies:
      | ConstructorArgsSymbols<TArgs, TLifeTime>
      | ((instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>),
    decorateFn?: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  ) {
    if (decorateFn && Array.isArray(dependencies)) {
      const definition = this._registry.getDefinitionForOverride(this._defSymbol);
      const decoratedDefinition = createDecoratedDefinition(definition, decorateFn, dependencies);

      this._onDefinition(decoratedDefinition);

      return;
    }

    if (typeof dependencies === 'function') {
      const definition = this._registry.getDefinitionForOverride(this._defSymbol);

      const decoratedDefinition = createDecoratedDefinition(
        definition,
        dependencies,
        [] as ConstructorArgsSymbols<TArgs, TLifeTime>,
      );

      this._onDefinition(decoratedDefinition);

      return;
    }

    throw new Error('Invalid params');
  }
}

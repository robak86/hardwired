import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { createConfiguredDefinition } from '../utils/create-configured-definition.js';
import { createDecoratedDefinition } from '../utils/create-decorated-definition.js';

import type { ConstructorArgsSymbols } from './SymbolsRegistrationBuilder.js';
import { SymbolsRegistrationBuilder } from './SymbolsRegistrationBuilder.js';

// TODO: we need to constraint allowed types that can be injected to configure and decorate functions
export class OverridesConfigBuilder<TInstance, TLifeTime extends LifeTime> extends SymbolsRegistrationBuilder<
  TInstance,
  TLifeTime
> {
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
      const decoratedDefinition = createDecoratedDefinition(this._registry, this._defSymbol, decorateFn, dependencies);

      this._onDefinition(decoratedDefinition);

      return;
    }

    if (typeof dependencies === 'function') {
      const decoratedDefinition = createDecoratedDefinition(
        this._registry,
        this._defSymbol,
        dependencies,
        [] as ConstructorArgsSymbols<TArgs, TLifeTime>,
      );

      this._onDefinition(decoratedDefinition);

      return;
    }

    throw new Error('Invalid params');
  }
}

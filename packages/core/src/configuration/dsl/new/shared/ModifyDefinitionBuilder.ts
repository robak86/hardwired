import type { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { MaybePromise } from '../../../../utils/async.js';
import type { IModifyBuilder } from '../../../abstract/IModifyAware.js';
import { ConfiguredDefinitionBuilder } from '../utils/ConfiguredDefinitionBuilder.js';
import { DecoratedDefinitionBuilder } from '../utils/DecoratedDefinitionBuilder.js';

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
    dependenciesOrConfigureFn:
      | ConstructorArgsSymbols<TArgs, TLifeTime>
      | ((instance: TInstance, ...args: TArgs) => MaybePromise<void>),
    configureFn?: (instance: TInstance, ...args: TArgs) => MaybePromise<void>,
  ) {
    if (configureFn && Array.isArray(dependenciesOrConfigureFn)) {
      const def = this._registry.getDefinitionForOverride(this._defSymbol);

      const configuredDefinition = new ConfiguredDefinitionBuilder(
        this._defSymbol,
        dependenciesOrConfigureFn,
        configureFn,
      ).build(def);

      this._onDefinition(configuredDefinition);

      return;
    }

    if (typeof dependenciesOrConfigureFn === 'function') {
      const def = this._registry.getDefinitionForOverride(this._defSymbol);

      const configuredDefinition = new ConfiguredDefinitionBuilder(
        this._defSymbol,
        [] as ConstructorArgsSymbols<TArgs, TLifeTime>,
        dependenciesOrConfigureFn,
      ).build(def);

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
    dependenciesOrDecorateFn:
      | ConstructorArgsSymbols<TArgs, TLifeTime>
      | ((instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>),
    decorateFn?: (instance: TInstance, ...args: TArgs) => MaybePromise<TInstance>,
  ) {
    if (decorateFn && Array.isArray(dependenciesOrDecorateFn)) {
      const definition = this._registry.getDefinitionForOverride(this._defSymbol);

      const decoratedDefinition = new DecoratedDefinitionBuilder(
        this._defSymbol,
        dependenciesOrDecorateFn,
        decorateFn,
      ).build(definition);

      this._onDefinition(decoratedDefinition);

      return;
    }

    if (typeof dependenciesOrDecorateFn === 'function') {
      const definition = this._registry.getDefinitionForOverride(this._defSymbol);

      const decoratedDefinition = new DecoratedDefinitionBuilder(
        this._defSymbol,
        [] as ConstructorArgsSymbols<TArgs, TLifeTime>,
        dependenciesOrDecorateFn,
      ).build(definition);

      this._onDefinition(decoratedDefinition);

      return;
    }

    throw new Error('Invalid params');
  }
}

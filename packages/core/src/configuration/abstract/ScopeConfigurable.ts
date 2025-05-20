import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { ScopeSymbolBinder } from '../dsl/new/ScopeSymbolBinder.js';
import type { IContainer } from '../../container/IContainer.js';
import type { OwningDefinitionBuilder } from '../dsl/new/OwningDefinitionBuilder.js';
import type { MaybePromise } from '../../utils/async.js';
import type { ScopeOverridesBinder } from '../dsl/new/ScopeOverridesBinder.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export interface ScopeConfigurable {
  add<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ScopeSymbolBinder<TInstance, TLifeTime>;

  onDispose(callback: (scope: IContainer) => void): void;

  own<TInstance>(symbol: DefinitionSymbol<TInstance, LifeTime.cascading>): OwningDefinitionBuilder<TInstance>;

  // onInit(initializer: InitFn): void;

  configure<TInstance>(
    symbol: IDefinitionSymbol<TInstance, ScopeConfigureAllowedLifeTimes>,
    configFn: (instance: TInstance) => MaybePromise<void>,
  ): void;

  decorate<TInstance>(
    symbol: IDefinitionSymbol<TInstance, ScopeConfigureAllowedLifeTimes>,
    configFn: (instance: TInstance) => MaybePromise<TInstance>,
  ): void;

  override<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ScopeOverridesBinder<TInstance, TLifeTime>;
}

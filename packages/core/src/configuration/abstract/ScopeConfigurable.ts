import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { DefinitionSymbol } from '../../definitions/def-symbol.js';
import type { ScopeSymbolBinder } from '../dsl/new/ScopeSymbolBinder.js';
import type { IContainer } from '../../container/IContainer.js';

import type { InitFn } from './ContainerConfigurable.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export interface ScopeConfigurable {
  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): ScopeSymbolBinder<TInstance, TLifeTime>;

  onDispose(callback: (scope: IContainer) => void): void;

  own<TInstance>(symbol: DefinitionSymbol<TInstance, LifeTime.cascading>): void;

  onInit(initializer: InitFn): void;

  // override<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
  //   definition: Definition<TInstance, TLifeTime, TArgs>,
  // ): Binder<TInstance, TLifeTime, TArgs>;
  //

  //
  // overrideCascading<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
  //   definition: Definition<TInstance, TLifeTime, []>,
  // ): Binder<TInstance, TLifeTime, []>;
  //
  // cascade<TInstance>(definition: Definition<TInstance, ScopeConfigureAllowedLifeTimes, []>): void;
}

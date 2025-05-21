import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { IContainer } from '../../container/IContainer.js';
import type { OwningDefinitionBuilder } from '../dsl/new/shared/OwningDefinitionBuilder.js';
import type { MaybePromise } from '../../utils/async.js';
import type { OverridesConfigBuilder } from '../dsl/new/shared/OverridesConfigBuilder.js';

import type { IRegisterAware } from './IRegisterAware.js';
import type { IOverrideAware } from './IOverrideAware.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.cascading;
export type ScopeOverrideAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export interface IScopeConfigurable
  extends IRegisterAware<ScopeConfigureAllowedLifeTimes>,
    IOverrideAware<ScopeOverrideAllowedLifeTimes> {
  eager<TInstance, TLifeTime extends LifeTime>(def: IDefinitionSymbol<TInstance, TLifeTime>): unknown;

  onDispose(callback: (scope: IContainer) => void): void;

  own<TInstance>(
    symbol: DefinitionSymbol<TInstance, LifeTime.cascading>,
  ): OwningDefinitionBuilder<TInstance, LifeTime.cascading>;

  // onInit(initializer: InitFn): void;

  configure<TInstance>(
    symbol: IDefinitionSymbol<TInstance, ScopeConfigureAllowedLifeTimes>,
    configFn: (instance: TInstance) => MaybePromise<void>,
  ): void;

  decorate<TInstance>(
    symbol: IDefinitionSymbol<TInstance, ScopeConfigureAllowedLifeTimes>,
    configFn: (instance: TInstance) => MaybePromise<TInstance>,
  ): void;

  override<TInstance, TLifeTime extends ScopeOverrideAllowedLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): OverridesConfigBuilder<TInstance, TLifeTime>;
}

import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { Binder } from '../../definitions/Binder.js';

import { InitFn } from './ContainerConfigurable.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export interface DisposableScopeConfigurable extends ScopeConfigurable {
  onDispose(disposeFn: InitFn): void;
}

export interface ScopeConfigurable {
  inheritLocal<TInstance>(definition: Definition<TInstance, ScopeConfigureAllowedLifeTimes, []>): void;
  inheritCascading<TInstance>(definition: Definition<TInstance, ScopeConfigureAllowedLifeTimes, []>): void;

  bindLocal<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;

  onInit(initializer: InitFn): void;

  bindCascading<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    definition: Definition<TInstance, TLifeTime, []>,
  ): Binder<TInstance, TLifeTime, []>;

  cascade<TInstance>(definition: Definition<TInstance, ScopeConfigureAllowedLifeTimes, []>): void;
}

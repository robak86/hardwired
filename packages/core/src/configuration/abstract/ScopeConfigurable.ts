import { Definition } from '../../definitions/abstract/Definition.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { Binder } from '../../definitions/Binder.js';

import { InitFn } from './ContainerConfigurable.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export interface ScopeConfigurable {
  inheritLocal<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void;
  inheritCascading<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void;

  bindLocal<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;

  onInit(initializer: InitFn): void;

  onDispose(disposeFn: InitFn): void;

  bindCascading<TInstance>(
    definition: Definition<TInstance, LifeTime.scoped, []>,
  ): Binder<TInstance, LifeTime.scoped, []>;

  cascade<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void;
}

import type { Definition } from '../../definitions/impl/Definition.js';
import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { Binder } from '../Binder.js';

import type { InitFn } from './ContainerConfigurable.js';

export type ScopeConfigureAllowedLifeTimes = LifeTime.transient | LifeTime.scoped;

export interface ScopeConfigurable {
  bind<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;

  onInit(initializer: InitFn): void;

  bindCascading<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    definition: Definition<TInstance, TLifeTime, []>,
  ): Binder<TInstance, TLifeTime, []>;

  cascade<TInstance>(definition: Definition<TInstance, ScopeConfigureAllowedLifeTimes, []>): void;
}

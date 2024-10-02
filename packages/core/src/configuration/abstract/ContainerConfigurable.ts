import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { Definition } from '../../definitions/abstract/Definition.js';
import { Binder } from '../../definitions/Binder.js';
import { UseFn } from '../../container/IContainer.js';

export type ContainerConfigureFreezeLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;
export type ContainerConfigurelocalLifeTimes = LifeTime.transient | LifeTime.scoped;
export type ContainerConfigurecascadingLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;

export type InitFn = (container: UseFn<any>) => void;

export interface ContainerConfigurable {
  cascading<TInstance>(
    definition: Definition<TInstance, ContainerConfigurecascadingLifeTimes, []>,
  ): Binder<TInstance, ContainerConfigurecascadingLifeTimes, []>;

  cascade<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void;

  local<TInstance, TLifeTime extends ContainerConfigurelocalLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Omit<Binder<TInstance, TLifeTime, TArgs>, 'toInheritedFrom'>;

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Omit<Binder<TInstance, TLifeTime, TArgs>, 'toInheritedFrom'>;

  init(initializer: InitFn): void;
}

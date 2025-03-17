import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { Definition } from '../../definitions/impl/Definition.js';
import type { Binder } from '../Binder.js';
import type { IContainer, UseFn } from '../../container/IContainer.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';

export type ContainerConfigureFreezeLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;
export type ContainerConfigureLocalLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;
export type ContainerConfigureCascadingLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;

export type InitFn = (container: UseFn<any>) => void;
export type DisposeFn = (container: UseFn<any>) => void;

export interface ContainerConfigurable {
  onDispose(callback: (scope: IContainer) => void): void;

  bindCascading<TInstance, TLifeTime extends ContainerConfigureCascadingLifeTimes>(
    definition: Definition<TInstance, TLifeTime, []>,
  ): Binder<TInstance, TLifeTime, []>;

  cascade<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void;

  bind<TInstance, TLifeTime extends ContainerConfigureLocalLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Omit<Binder<TInstance, TLifeTime, TArgs>, 'toInheritedFrom'>;

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Omit<Binder<TInstance, TLifeTime, TArgs>, 'toInheritedFrom'>;

  init(initializer: InitFn): void;

  withInterceptor(id: string | symbol, interceptor: IInterceptor<unknown>): void;
}

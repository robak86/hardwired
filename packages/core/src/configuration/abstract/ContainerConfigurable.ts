import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { Binder } from '../Binder.js';
import type { IContainer, UseFn } from '../../container/IContainer.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';

export type ContainerConfigureFreezeLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;
export type ContainerConfigureLocalLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;
export type ContainerConfigureCascadingLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;

export type InitFn = (container: UseFn<any>) => void;
export type DisposeFn = (container: UseFn<any>) => void;

export interface ContainerConfigurable {
  onDispose(callback: (scope: IContainer) => void): void;

  overrideCascading<TInstance, TLifeTime extends ContainerConfigureCascadingLifeTimes>(
    definition: IDefinition<TInstance, TLifeTime, []>,
  ): Binder<TInstance, TLifeTime, []>;

  cascade<TInstance>(definition: IDefinition<TInstance, LifeTime.scoped, []>): void;

  bind<TInstance, TLifeTime extends ContainerConfigureLocalLifeTimes, TArgs extends any[]>(
    definition: IDefinition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends any[]>(
    definition: IDefinition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs>;

  init(initializer: InitFn): void;

  withInterceptor(id: string | symbol, interceptor: IInterceptor<unknown>): void;
}

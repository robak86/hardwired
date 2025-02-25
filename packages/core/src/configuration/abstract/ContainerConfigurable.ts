import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { Definition } from '../../definitions/abstract/Definition.js';
import { Binder } from '../../definitions/Binder.js';
import { UseFn } from '../../container/IContainer.js';
import { IInterceptor } from '../../container/interceptors/interceptor.js';

export type ContainerConfigureFreezeLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;
export type ContainerConfigureLocalLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;
export type ContainerConfigureCascadingLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;

export type InitFn = (container: UseFn<any>) => void;
export type DisposeFn = (container: UseFn<any>) => void;

export interface ContainerConfigurable {
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

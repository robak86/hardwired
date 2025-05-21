import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IContainer, UseFn } from '../../container/IContainer.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { OverridesConfigBuilder } from '../dsl/new/shared/OverridesConfigBuilder.js';

import type { IRegisterAware } from './IRegisterAware.js';

export type ContainerConfigureFreezeLifeTimes =
  | LifeTime.transient
  | LifeTime.scoped
  | LifeTime.singleton
  | LifeTime.cascading;

export type ContainerConfigurationAllowedRegistrationLifeTimes =
  | LifeTime.transient
  | LifeTime.scoped
  | LifeTime.singleton
  | LifeTime.cascading;

export type ContainerConfigureLocalLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;
export type ContainerConfigureCascadingLifeTimes = LifeTime.transient | LifeTime.scoped | LifeTime.singleton;

export type InitFn = (container: UseFn<any>) => void;
export type DisposeFn = (container: UseFn<any>) => void;

export interface IContainerConfigurable extends IRegisterAware<ContainerConfigurationAllowedRegistrationLifeTimes> {
  onDispose(callback: (scope: IContainer) => void): void;

  withInterceptor(id: string | symbol, interceptor: IInterceptor<unknown>): void;

  override<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): OverridesConfigBuilder<TInstance, TLifeTime>;

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): OverridesConfigBuilder<TInstance, TLifeTime>;

  // init(initializer: InitFn): void;

  //
  // overrideCascading<TInstance, TLifeTime extends ContainerConfigureCascadingLifeTimes>(
  //   definition: IDefinition<TInstance, TLifeTime, []>,
  // ): Binder<TInstance, TLifeTime, []>;
  //
  // cascade<TInstance>(definition: IDefinition<TInstance, LifeTime.scoped, []>): void;
  //
  // override<TInstance, TLifeTime extends ContainerConfigureLocalLifeTimes, TArgs extends any[]>(
  //   definition: IDefinition<TInstance, TLifeTime, TArgs>,
  // ): Binder<TInstance, TLifeTime, TArgs>;
  //
  // bind<TInstance, TLifeTime extends ContainerConfigureLocalLifeTimes>(
  //   unboundDef: UnboundDefinition<TInstance, TLifeTime>,
  //   def: IDefinition<TInstance, TLifeTime, []>,
  // ): void;
  //
  // freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends any[]>(
  //   definition: IDefinition<TInstance, TLifeTime, TArgs>,
  // ): Binder<TInstance, TLifeTime, TArgs>;
  //
  // init(initializer: InitFn): void;
  //
}

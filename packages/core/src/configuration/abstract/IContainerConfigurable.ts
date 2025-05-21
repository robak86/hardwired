import type { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IContainer, UseFn } from '../../container/IContainer.js';
import type { IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { ModifyDefinitionBuilder } from '../dsl/new/shared/ModifyDefinitionBuilder.js';

import type { IRegisterAware } from './IRegisterAware.js';
import type { IContainerModifyAware } from './IModifyAware.js';
import type { IEagerInstantiationAware } from './IEagerInstantiationAware.js';
import type { ILazyInstantiationAware } from './ILazyInstantiationAware.js';

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

export interface IContainerConfigurable
  extends IRegisterAware<ContainerConfigurationAllowedRegistrationLifeTimes>,
    IContainerModifyAware<ContainerConfigurationAllowedRegistrationLifeTimes>,
    IEagerInstantiationAware<ContainerConfigurationAllowedRegistrationLifeTimes>,
    ILazyInstantiationAware<ContainerConfigurationAllowedRegistrationLifeTimes> {
  onDispose(callback: (scope: IContainer) => void): void;

  withInterceptor(id: string | symbol, interceptor: IInterceptor<unknown>): void;

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ModifyDefinitionBuilder<TInstance, TLifeTime>;
}

import type {
  ContainerConfigurationAllowedRegistrationLifeTimes,
  ContainerConfigureFreezeLifeTimes,
  IContainerConfigurable,
} from '../../../abstract/IContainerConfigurable.js';
import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IContainer } from '../../../../container/IContainer.js';
import type { IInterceptor, InterceptorClass } from '../../../../container/interceptors/interceptor.js';
import { ModifyDefinitionBuilder } from '../shared/ModifyDefinitionBuilder.js';
import { AddDefinitionBuilder } from '../shared/AddDefinitionBuilder.js';
import type { IAddDefinitionBuilder } from '../../../abstract/IRegisterAware.js';
import type { IModifyBuilder } from '../../../abstract/IModifyAware.js';
import { ConfigurationBuildersContext } from '../shared/context/ConfigurationBuildersContext.js';
import type { DefinitionToken, IDefinitionToken } from '../../../../definitions/DefinitionToken.js';
import type { ScopeConfigureAllowedLifeTimes } from '../../../abstract/IScopeConfigurable.js';
import type { IInitBuilder } from '../../../abstract/IInitBuilder.js';
import { InitDefinitionBuilder } from '../shared/InitDefinitionBuilder.js';

import { type IContainerConfiguration } from './ContainerConfiguration.js';

export class ContainerConfigurationBuilder implements IContainerConfigurable {
  private readonly _allowedRegisterLifeTimes = [
    LifeTime.scoped,
    LifeTime.transient,
    LifeTime.singleton,
    LifeTime.cascading,
  ];
  private readonly _allowedModifyLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.singleton];

  private readonly _allowedCascadingModifyLifeTimes = [
    LifeTime.scoped,
    LifeTime.transient,
    LifeTime.singleton,
    LifeTime.cascading,
  ];

  private readonly _initAllowedLifeTimes: ScopeConfigureAllowedLifeTimes[] = [
    LifeTime.scoped,
    LifeTime.transient,
    LifeTime.cascading,
  ];

  private _context = ConfigurationBuildersContext.create();

  toConfig(): IContainerConfiguration {
    return this._context.toConfig();
  }

  modify<TInstance, TLifeTime extends ContainerConfigurationAllowedRegistrationLifeTimes>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IModifyBuilder<TInstance, TLifeTime, []> {
    const allowedLifeTimes =
      symbol.strategy === LifeTime.cascading ? this._allowedCascadingModifyLifeTimes : this._allowedModifyLifeTimes;

    return new ModifyDefinitionBuilder<TInstance, TLifeTime, []>(
      'modify',
      symbol,
      allowedLifeTimes,
      this._context,
      [],
    ) as IModifyBuilder<TInstance, TLifeTime, []>;
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): ModifyDefinitionBuilder<TInstance, TLifeTime, []> {
    return new ModifyDefinitionBuilder('freeze', symbol, this._allowedRegisterLifeTimes, this._context, []);
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionToken<TInstance, TLifeTime>,
  ): IAddDefinitionBuilder<TInstance, TLifeTime, []> {
    return new AddDefinitionBuilder<TInstance, TLifeTime, []>(
      'add',
      symbol,
      this._allowedRegisterLifeTimes,
      this._context,
      [],
    );
  }

  withInterceptor(interceptor: InterceptorClass<IInterceptor>): void {
    this._context.withInterceptor(interceptor);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._context.onDispose(callback);
  }

  // TODO: use for optimizations
  onDisposeAsync(callback: (scope: IContainer) => Promise<void>): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this._context.onDispose(callback);
  }

  // TODO: for scope configuration we shouldn't allow initialization of singleton
  init<TInstance, TLifeTime extends LifeTime>(
    token: IDefinitionToken<TInstance, TLifeTime>,
  ): IInitBuilder<TInstance, TLifeTime, []> {
    return new InitDefinitionBuilder<TInstance, TLifeTime, []>(token, this._initAllowedLifeTimes, this._context, []);
  }
}

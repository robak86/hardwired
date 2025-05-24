import type {
  ContainerConfigurationAllowedRegistrationLifeTimes,
  ContainerConfigureFreezeLifeTimes,
  IContainerConfigurable,
} from '../../../abstract/IContainerConfigurable.js';
import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { IContainer } from '../../../../container/IContainer.js';
import type { DefinitionSymbol, IDefinitionToken } from '../../../../definitions/def-symbol.js';
import type { IInterceptor, InterceptorClass } from '../../../../container/interceptors/interceptor.js';
import { ModifyDefinitionBuilder } from '../shared/ModifyDefinitionBuilder.js';
import { AddDefinitionBuilder } from '../shared/AddDefinitionBuilder.js';
import type { IAddDefinitionBuilder } from '../../../abstract/IRegisterAware.js';
import type { IConfigureBuilder, IModifyBuilder } from '../../../abstract/IModifyAware.js';
import { ConfigurationBuildersContext } from '../shared/context/ConfigurationBuildersContext.js';

import { type IConfiguration } from './ContainerConfiguration.js';

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

  private _context = ConfigurationBuildersContext.create();

  toConfig(): IConfiguration {
    return this._context.toConfig();
  }

  modify<TInstance, TLifeTime extends ContainerConfigurationAllowedRegistrationLifeTimes>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): IModifyBuilder<TInstance, TLifeTime> {
    const allowedLifeTimes =
      symbol.strategy === LifeTime.cascading ? this._allowedCascadingModifyLifeTimes : this._allowedModifyLifeTimes;

    return new ModifyDefinitionBuilder<TInstance, TLifeTime>(
      'modify',
      symbol,
      allowedLifeTimes,
      this._context,
    ) as IModifyBuilder<TInstance, TLifeTime>;
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionToken<TInstance, TLifeTime>,
  ): ModifyDefinitionBuilder<TInstance, TLifeTime> {
    return new ModifyDefinitionBuilder('freeze', symbol, this._allowedRegisterLifeTimes, this._context);
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): IAddDefinitionBuilder<TInstance, TLifeTime> {
    return new AddDefinitionBuilder('add', symbol, this._allowedRegisterLifeTimes, this._context);
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

  eager<TInstance, TLifeTime extends ContainerConfigurationAllowedRegistrationLifeTimes>(
    def: IDefinitionToken<TInstance, TLifeTime>,
  ): IConfigureBuilder<TInstance, TLifeTime> {
    throw new Error('Implement me!');
    // this._initializationFns.push(() => {
    //   const instance = this._currentContainer.use(symbol);
    //
    //   return maybePromiseThen(instance, awaitedInstance => {
    //     return configureFn(awaitedInstance);
    //   });
    // });
  }

  lazy<TInstance, TLifeTime extends ContainerConfigurationAllowedRegistrationLifeTimes>(
    def: IDefinitionToken<TInstance, TLifeTime>,
  ): IConfigureBuilder<TInstance, TLifeTime> {
    throw new Error('Implement me!');
    // this._initializationFns.push(() => {
    //   const instance = this._currentContainer.use(symbol);
    //
    //   return maybePromiseThen(instance, awaitedInstance => {
    //     return configureFn(awaitedInstance);
    //   });
    // });
  }
}

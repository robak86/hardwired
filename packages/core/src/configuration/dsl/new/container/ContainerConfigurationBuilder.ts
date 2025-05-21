import type {
  IContainerConfigurable,
  ContainerConfigureFreezeLifeTimes,
} from '../../../abstract/IContainerConfigurable.js';
import { LifeTime } from '../../../../definitions/abstract/LifeTime.js';
import type { BindingsRegistry } from '../../../../context/BindingsRegistry.js';
import type { IContainer, IStrategyAware } from '../../../../container/IContainer.js';
import type { InterceptorsRegistry } from '../../../../container/interceptors/InterceptorsRegistry.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../../../definitions/def-symbol.js';
import type { IInterceptor } from '../../../../container/interceptors/interceptor.js';
import type { IDefinition } from '../../../../definitions/abstract/IDefinition.js';
import { OverridesConfigBuilder } from '../shared/OverridesConfigBuilder.js';
import type { MaybePromise } from '../../../../utils/async.js';
import { maybePromiseThen } from '../../../../utils/async.js';
import { createConfiguredDefinition } from '../utils/create-configured-definition.js';
import { SymbolsRegistrationBuilder } from '../shared/SymbolsRegistrationBuilder.js';

export class ContainerConfigurationBuilder implements IContainerConfigurable {
  private readonly _allowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.singleton, LifeTime.cascading];

  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private _currentContainer: IContainer & IStrategyAware,
    private _interceptors: InterceptorsRegistry,
    private _disposeFns: Array<(scope: IContainer) => void>,
    private _initializationFns: Array<(scope: unknown) => MaybePromise<void>> = [],
  ) {}

  override<TInstance, TLifeTime extends LifeTime>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): OverridesConfigBuilder<TInstance, TLifeTime> {
    return new OverridesConfigBuilder(
      symbol,
      this._bindingsRegistry,
      this._allowedLifeTimes,
      (def: IDefinition<TInstance, TLifeTime>) => {
        this._bindingsRegistry.override(def);
      },
    );
  }

  configure<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
    configureFn: (instance: TInstance) => MaybePromise<void>,
  ) {
    const configuredDefinition = createConfiguredDefinition(this._bindingsRegistry, symbol, configureFn, []);

    this._bindingsRegistry.override(configuredDefinition);
  }

  eager<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
    configureFn: (instance: TInstance) => MaybePromise<void>,
  ) {
    this._initializationFns.push(() => {
      const instance = this._currentContainer.use(symbol);

      return maybePromiseThen(instance, awaitedInstance => {
        return configureFn(awaitedInstance);
      });
    });
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): OverridesConfigBuilder<TInstance, TLifeTime> {
    return new OverridesConfigBuilder(
      symbol,
      this._bindingsRegistry,
      this._allowedLifeTimes,
      (def: IDefinition<TInstance, TLifeTime>) => {
        this._bindingsRegistry.freeze(def);
      },
    );
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): SymbolsRegistrationBuilder<TInstance, TLifeTime> {
    return new SymbolsRegistrationBuilder(
      symbol,
      this._bindingsRegistry,
      this._allowedLifeTimes,
      (definition: IDefinition<TInstance, TLifeTime>) => {
        this._bindingsRegistry.register(symbol, definition, this._currentContainer);
      },
    );
  }

  withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void {
    this._interceptors.register(name, interceptor);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }
}

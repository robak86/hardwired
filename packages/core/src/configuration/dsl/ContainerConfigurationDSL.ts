import type { ContainerConfigurable, ContainerConfigureFreezeLifeTimes } from '../abstract/ContainerConfigurable.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import type { InterceptorsRegistry } from '../../container/interceptors/InterceptorsRegistry.js';
import type { DefinitionSymbol, IDefinitionSymbol } from '../../definitions/def-symbol.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { ScopeConfigureAllowedLifeTimes } from '../abstract/ScopeConfigurable.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';

import { ContainerSymbolBinder } from './new/ContainerSymbolBinder.js';
import { ScopeOverridesBinder } from './new/scope/ScopeOverridesBinder.js';

export class ContainerConfigurationDSL implements ContainerConfigurable {
  private readonly _allowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.singleton];

  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private _currentContainer: IContainer & IStrategyAware,
    private _interceptors: InterceptorsRegistry,
    private _disposeFns: Array<(scope: IContainer) => void>,
  ) {}

  override<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ScopeOverridesBinder<TInstance, TLifeTime> {
    return new ScopeOverridesBinder(symbol, this._bindingsRegistry, (def: IDefinition<TInstance, TLifeTime>) => {
      this._bindingsRegistry.override(def);
    });
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    symbol: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ScopeOverridesBinder<TInstance, TLifeTime> {
    return new ScopeOverridesBinder(symbol, this._bindingsRegistry, (def: IDefinition<TInstance, TLifeTime>) => {
      this._bindingsRegistry.freeze(def);
    });
  }

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): ContainerSymbolBinder<TInstance, TLifeTime> {
    return new ContainerSymbolBinder(symbol, this._bindingsRegistry, this._currentContainer);
  }

  withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void {
    this._interceptors.register(name, interceptor);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }
}

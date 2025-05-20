import type { ContainerConfigurable } from '../abstract/ContainerConfigurable.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import type { InterceptorsRegistry } from '../../container/interceptors/InterceptorsRegistry.js';
import type { DefinitionSymbol } from '../../definitions/def-symbol.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';

import { ContainerSymbolBinder } from './new/ContainerSymbolBinder.js';

export class ContainerConfigurationDSL implements ContainerConfigurable {
  private readonly _allowedLifeTimes = [LifeTime.scoped, LifeTime.transient, LifeTime.singleton];

  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private _currentContainer: IContainer & IStrategyAware,
    private _interceptors: InterceptorsRegistry,
    private _disposeFns: Array<(scope: IContainer) => void>,
  ) {}

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

  // cascade<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void {
  //   this._bindingsRegistry.addCascadingBinding(definition.bindToContainer(this._currentContainer));
  // }
  //
  // init(initializer: InitFn): void {
  //   initializer(this._currentContainer);
  // }
  //
  // overrideCascading<TInstance, TLifeTime extends ContainerConfigureCascadingLifeTimes>(
  //   definition: IDefinition<TInstance, TLifeTime, []>,
  // ): Binder<TInstance, TLifeTime, []> {
  //   return new Binder<TInstance, TLifeTime, []>(
  //     definition,
  //     this._allowedLifeTimes,
  //     this._onCascadingStaticBind,
  //     this._onCascadingInstantiableBind,
  //   );
  // }
  //
  // override<TInstance, TLifeTime extends ContainerConfigureLocalLifeTimes, TArgs extends unknown[]>(
  //   definition: Definition<TInstance, TLifeTime, TArgs>,
  // ): Binder<TInstance, TLifeTime, TArgs> {
  //   return new Binder<TInstance, TLifeTime, TArgs>(
  //     definition,
  //     this._allowedLifeTimes,
  //     this._onLocalStaticBind,
  //     this._onLocalInstantiableBind,
  //   );
  // }
  //
  // bind<TInstance, TLifeTime extends ContainerConfigureLocalLifeTimes>(
  //   unboundDef: UnboundDefinition<TInstance, TLifeTime>,
  //   def: IDefinition<TInstance, TLifeTime, []>,
  // ): void {
  //   this.override(unboundDef).to(def);
  // }
  //
  // freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends unknown[]>(
  //   definition: Definition<TInstance, TLifeTime, TArgs>,
  // ): Binder<TInstance, TLifeTime, TArgs> {
  //   return new Binder<TInstance, TLifeTime, TArgs>(
  //     definition,
  //     this._allowedLifeTimes,
  //     this._onFrozenStaticBind,
  //     this._onFrozenInstantiableBind,
  //   );
  // }
  //
  // private _onFrozenStaticBind = (newDefinition: AnyDefinitionSymbol) => {
  //   this._bindingsRegistry.addFrozenBinding(newDefinition);
  // };
  // private _onFrozenInstantiableBind = (newDefinition: AnyDefinitionSymbol) => {
  //   this._bindingsRegistry.addFrozenBinding(newDefinition);
  // };
  //
  // private _onCascadingStaticBind = (newDefinition: AnyDefinitionSymbol) => {
  //   this._bindingsRegistry.addCascadingBinding(newDefinition);
  // };
  //
  // private _onCascadingInstantiableBind = (newDefinition: AnyDefinitionSymbol) => {
  //   this._bindingsRegistry.addCascadingBinding(newDefinition.bindToContainer(this._currentContainer));
  // };
  //
  // private _onLocalStaticBind = (newDefinition: AnyDefinitionSymbol) => {
  //   this._bindingsRegistry.addScopeBinding(newDefinition);
  // };
  // private _onLocalInstantiableBind = (newDefinition: AnyDefinitionSymbol) => {
  //   this._bindingsRegistry.addScopeBinding(newDefinition);
  // };
}

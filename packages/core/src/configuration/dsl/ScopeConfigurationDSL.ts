import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { ScopeConfigurable } from '../abstract/ScopeConfigurable.js';
import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import type { DefinitionSymbol } from '../../definitions/def-symbol.js';

import { ScopeSymbolBinder } from './new/ScopeSymbolBinder.js';

export class ScopeConfigurationDSL implements ScopeConfigurable {
  private readonly _allowedLifeTimes = [LifeTime.scoped, LifeTime.transient];

  constructor(
    private _currentContainer: IContainer & IStrategyAware,
    private _bindingsRegistry: BindingsRegistry,
    private _tags: (string | symbol)[],
    private _disposeFns: Array<(scope: IContainer) => void>,
  ) {}

  add<TInstance, TLifeTime extends LifeTime>(
    symbol: DefinitionSymbol<TInstance, TLifeTime>,
  ): ScopeSymbolBinder<TInstance, TLifeTime> {
    return new ScopeSymbolBinder(symbol, this._bindingsRegistry, this._currentContainer);
  }

  own<TInstance>(symbol: DefinitionSymbol<TInstance, LifeTime.cascading>): void {
    this._bindingsRegistry.ownCascading(symbol, this._currentContainer);
  }

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }

  //
  // appendTag(tag: string | symbol): void {
  //   if (!this._tags.includes(tag)) {
  //     this._tags.push(tag);
  //   }
  // }
  //
  // cascade<TInstance>(definition: Definition<TInstance, ScopeConfigureAllowedLifeTimes, []>): void {
  //   this._bindingsRegistry.addCascadingBinding(definition.bindToContainer(this._currentContainer));
  // }
  //
  // overrideCascading<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
  //   definition: Definition<TInstance, TLifeTime, []>,
  // ): Binder<TInstance, TLifeTime, []> {
  //   if (!(definition instanceof UnboundDefinition)) {
  //     if ((definition.strategy as LifeTime) !== LifeTime.scoped) {
  //       throw new Error(`Cascading is allowed only for scoped.`);
  //     }
  //   }
  //
  //   return new Binder<TInstance, TLifeTime, []>(
  //     definition,
  //     this._allowedLifeTimes,
  //     this._onCascadingStaticBind,
  //     this._onCascadingInstantiableBind,
  //   );
  // }
  //
  // onInit(initializer: InitFn): void {
  //   initializer(this._currentContainer);
  // }
  //
  // override<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
  //   definition: Definition<TInstance, TLifeTime>,
  // ): Binder<TInstance, TLifeTime, TArgs> {
  //   if ((definition.strategy as LifeTime) === LifeTime.singleton) {
  //     throw new Error(`Binding singletons in for child scopes is not allowed.`);
  //   }
  //
  //   return new Binder<TInstance, TLifeTime, TArgs>(
  //     definition,
  //     this._allowedLifeTimes,
  //     this._onLocalStaticBind,
  //     this._onLocalInstantiableBind,
  //   );
  // }
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
  //
  // private _onLocalInstantiableBind = (newDefinition: AnyDefinitionSymbol) => {
  //   this._bindingsRegistry.addScopeBinding(newDefinition);
  // };
}

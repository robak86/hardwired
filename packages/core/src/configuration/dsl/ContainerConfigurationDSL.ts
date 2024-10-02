import { AnyDefinition, Definition } from '../../definitions/abstract/Definition.js';
import { Binder } from '../../definitions/Binder.js';
import {
  ContainerConfigurable,
  ContainerConfigurecascadingLifeTimes,
  ContainerConfigurelocalLifeTimes,
  ContainerConfigureFreezeLifeTimes,
  InitFn,
} from '../abstract/ContainerConfigurable.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { BindingsRegistry } from '../../context/BindingsRegistry.js';
import { IContainer, IStrategyAware } from '../../container/IContainer.js';

export class ContainerConfigurationDSL implements ContainerConfigurable {
  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private _currentContainer: IContainer & IStrategyAware,
  ) {}

  cascade<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void {
    // TODO: check if has local definition. If, so then use it.

    this._bindingsRegistry.addCascadingBinding(definition.bind(this._currentContainer));
  }

  init(initializer: InitFn): void {
    initializer(this._currentContainer);
  }

  cascading<TInstance>(
    definition: Definition<TInstance, ContainerConfigurecascadingLifeTimes, []>,
  ): Binder<TInstance, ContainerConfigurecascadingLifeTimes, []> {
    return new Binder(definition, this._onCascadingStaticBind, this._onCascadingInstantiableBind);
  }

  local<TInstance, TLifeTime extends ContainerConfigurelocalLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if ((definition.strategy as LifeTime) === LifeTime.singleton) {
      throw new Error(`Singleton is not allowed for local bindings.`);
    }

    return new Binder(definition, this._onLocalStaticBind, this._onLocalInstantiableBind);
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    return new Binder(definition, this._onFrozenStaticBind, this._onFrozenInstantiableBind);
  }

  private _onFrozenStaticBind = (newDefinition: AnyDefinition) => {
    this._bindingsRegistry.addFrozenBinding(newDefinition);
  };
  private _onFrozenInstantiableBind = (newDefinition: AnyDefinition) => {
    this._bindingsRegistry.addFrozenBinding(newDefinition);
  };

  private _onCascadingStaticBind = (newDefinition: AnyDefinition) => {
    this._bindingsRegistry.addCascadingBinding(newDefinition);
  };

  private _onCascadingInstantiableBind = (newDefinition: AnyDefinition) => {
    this._bindingsRegistry.addCascadingBinding(newDefinition.bind(this._currentContainer));
  };

  private _onLocalStaticBind = (newDefinition: AnyDefinition) => {
    this._bindingsRegistry.addScopeBinding(newDefinition);
  };
  private _onLocalInstantiableBind = (newDefinition: AnyDefinition) => {
    this._bindingsRegistry.addScopeBinding(newDefinition);
  };
}

import { Definition } from '../../definitions/abstract/Definition.js';
import { Binder } from '../../definitions/Binder.js';
import {
  ContainerConfigurable,
  ContainerConfigureAllowedLifeTimes,
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

  bindCascading<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, LifeTime.scoped, []>,
  ): Binder<TInstance, LifeTime.scoped, []> {
    if ((definition.strategy as LifeTime) !== LifeTime.scoped) {
      throw new Error(`Cascading is allowed only for singletons.`); // TODO: maybe I should allow it for scoped as well?
    }

    return new Binder(definition, this._onCascadingStaticBind, this._onCascadingInstantiableBind);
  }

  bindLocal<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    return new Binder(definition, this._onLocalStaticBind, this._onLocalInstantiableBind);
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    return new Binder(definition, this._onFrozenStaticBind, this._onFrozenInstantiableBind);
  }

  private _onFrozenStaticBind = (newDefinition: Definition<any, any, any>) => {
    this._bindingsRegistry.addFrozenBinding(newDefinition);
  };
  private _onFrozenInstantiableBind = (newDefinition: Definition<any, any, any>) => {
    this._bindingsRegistry.addFrozenBinding(newDefinition);
  };

  private _onCascadingStaticBind = (newDefinition: Definition<any, any, any>) => {
    this._bindingsRegistry.addCascadingBinding(newDefinition);
  };

  private _onCascadingInstantiableBind = (newDefinition: Definition<any, any, any>) => {
    this._bindingsRegistry.addCascadingBinding(newDefinition.bind(this._currentContainer));
  };

  private _onLocalStaticBind = (newDefinition: Definition<any, any, any>) => {
    this._bindingsRegistry.addScopeBinding(newDefinition);
  };
  private _onLocalInstantiableBind = (newDefinition: Definition<any, any, any>) => {
    this._bindingsRegistry.addScopeBinding(newDefinition);
  };
}

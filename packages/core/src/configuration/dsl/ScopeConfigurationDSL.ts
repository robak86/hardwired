import { AnyDefinition, Definition } from '../../definitions/abstract/Definition.js';
import { InitFn } from '../abstract/ContainerConfigurable.js';
import { Binder } from '../../definitions/Binder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { ScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../abstract/ScopeConfigurable.js';
import { IContainer, IStrategyAware } from '../../container/IContainer.js';
import { BindingsRegistry } from '../../context/BindingsRegistry.js';

export class ScopeConfigurationDSL implements ScopeConfigurable {
  constructor(
    private _parentContainer: IContainer & IStrategyAware,
    private _currentContainer: IContainer & IStrategyAware,
    private _bindingsRegistry: BindingsRegistry,
  ) {}

  markCascading<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void {
    this._bindingsRegistry.addCascadingBinding(definition.bind(this._currentContainer));
  }

  inheritLocal<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void {
    this._bindingsRegistry.addScopeBinding(definition.bind(this._parentContainer));
  }

  inheritCascading<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void {
    const newDefinition = new Definition(definition.id, LifeTime.transient, (_, ...args: []) => {
      return this._parentContainer.use(definition, ...args);
    });

    this._bindingsRegistry.addCascadingBinding(newDefinition);
  }

  cascading<TInstance, TArgs extends any[]>(
    definition: Definition<TInstance, LifeTime.scoped, []>,
  ): Binder<TInstance, LifeTime.scoped, []> {
    if ((definition.strategy as LifeTime) !== LifeTime.scoped) {
      throw new Error(`Cascading is allowed only for singletons.`); // TODO: maybe I should allow it for scoped as well?
    }

    return new Binder(definition, this._onCascadingStaticBind, this._onCascadingInstantiableBind);
  }

  onInit(initializer: InitFn): void {
    initializer(this._currentContainer);
  }

  local<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if ((definition.strategy as LifeTime) === LifeTime.singleton) {
      throw new Error(`Binding singletons in for child scopes is not allowed.`);
    }

    return new Binder(definition, this._onLocalStaticBind, this._onLocalInstantiableBind);
  }

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

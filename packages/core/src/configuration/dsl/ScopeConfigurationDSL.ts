import { AnyDefinition, Definition } from '../../definitions/abstract/Definition.js';
import { InitFn } from '../abstract/ContainerConfigurable.js';
import { Binder } from '../../definitions/Binder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { ScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../abstract/ScopeConfigurable.js';
import { IContainer, IStrategyAware } from '../../container/IContainer.js';
import { BindingsRegistry } from '../../context/BindingsRegistry.js';

export class ScopeConfigurationDSL implements ScopeConfigurable {
  constructor(
    private _currentContainer: IContainer & IStrategyAware,
    private _bindingsRegistry: BindingsRegistry,
    private _tags: (string | symbol)[],
  ) {}

  appendTag(tag: string | symbol): void {
    if (!this._tags.includes(tag)) {
      this._tags.push(tag);
    }
  }

  cascade<TInstance>(definition: Definition<TInstance, ScopeConfigureAllowedLifeTimes, []>): void {
    this._bindingsRegistry.addCascadingBinding(definition.bind(this._currentContainer));
  }

  bindCascading<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes>(
    definition: Definition<TInstance, TLifeTime, []>,
  ): Binder<TInstance, TLifeTime, []> {
    if ((definition.strategy as LifeTime) !== LifeTime.scoped) {
      throw new Error(`Cascading is allowed only for scoped.`);
    }

    return new Binder(definition, this._onCascadingStaticBind, this._onCascadingInstantiableBind);
  }

  onInit(initializer: InitFn): void {
    initializer(this._currentContainer);
  }

  bindLocal<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
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

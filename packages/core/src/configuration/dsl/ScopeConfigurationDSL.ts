import type { Definition } from '../../definitions/impl/Definition.js';
import type { InitFn } from '../abstract/ContainerConfigurable.js';
import { Binder } from '../Binder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { ScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../abstract/ScopeConfigurable.js';
import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import type { AnyDefinition } from '../../definitions/abstract/IDefinition.js';

export class ScopeConfigurationDSL implements ScopeConfigurable {
  constructor(
    private _currentContainer: IContainer & IStrategyAware,
    private _bindingsRegistry: BindingsRegistry,
    private _tags: (string | symbol)[],
    private _disposeFns: Array<(scope: IContainer) => void>,
  ) {}

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }

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

    return new Binder<TInstance, TLifeTime, []>(
      definition,
      this._onCascadingStaticBind,
      this._onCascadingInstantiableBind,
    );
  }

  onInit(initializer: InitFn): void {
    initializer(this._currentContainer);
  }

  bind<TInstance, TLifeTime extends ScopeConfigureAllowedLifeTimes, TArgs extends any[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if ((definition.strategy as LifeTime) === LifeTime.singleton) {
      throw new Error(`Binding singletons in for child scopes is not allowed.`);
    }

    return new Binder<TInstance, TLifeTime, TArgs>(definition, this._onLocalStaticBind, this._onLocalInstantiableBind);
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

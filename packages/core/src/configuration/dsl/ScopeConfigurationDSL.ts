import type { AnyDefinition, Definition } from '../../definitions/abstract/Definition.js';
import type { InitFn } from '../abstract/ContainerConfigurable.js';
import { Binder } from '../../definitions/Binder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { ScopeConfigurable, ScopeConfigureAllowedLifeTimes } from '../abstract/ScopeConfigurable.js';
import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import type { InstancesStore } from '../../context/InstancesStore.js';
import { DefinitionDisposable } from '../../utils/DefinitionDisposable.js';

export class ScopeConfigurationDSL implements ScopeConfigurable {
  constructor(
    private _currentContainer: IContainer & IStrategyAware,
    private _bindingsRegistry: BindingsRegistry,
    private _instancesRegistry: InstancesStore,
    private _disposables: DefinitionDisposable<any>[],
    private _tags: (string | symbol)[],
  ) {}

  onDispose<T>(
    definition: Definition<T, LifeTime.scoped, []>,
    disposeFn: (instance: Awaited<T>) => void | Promise<void>,
  ): void {
    if (this._bindingsRegistry.inheritsScopedDefinition(definition.id)) {
      throw new Error(`Cannot register dispose function for cascading scoped definition ${definition.name}`);
    }

    this._disposables.push(
      new DefinitionDisposable(definition, disposeFn, this._bindingsRegistry, this._instancesRegistry),
    );
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

    return new Binder(definition, this._onCascadingStaticBind, this._onCascadingInstantiableBind);
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

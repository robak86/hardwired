import type { Definition } from '../../definitions/impl/Definition.js';
import { Binder } from '../Binder.js';
import type {
  ContainerConfigurable,
  ContainerConfigureCascadingLifeTimes,
  ContainerConfigureFreezeLifeTimes,
  ContainerConfigureLocalLifeTimes,
  InitFn,
} from '../abstract/ContainerConfigurable.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { BindingsRegistry } from '../../context/BindingsRegistry.js';
import type { IContainer, IStrategyAware } from '../../container/IContainer.js';
import type { IInterceptor } from '../../container/interceptors/interceptor.js';
import type { InterceptorsRegistry } from '../../container/interceptors/InterceptorsRegistry.js';
import type { AnyDefinition, IDefinition } from '../../definitions/abstract/IDefinition.js';

export class ContainerConfigurationDSL implements ContainerConfigurable {
  constructor(
    private _bindingsRegistry: BindingsRegistry,
    private _currentContainer: IContainer & IStrategyAware,
    private _interceptors: InterceptorsRegistry,
    private _disposeFns: Array<(scope: IContainer) => void>,
  ) {}

  onDispose(callback: (scope: IContainer) => void): void {
    this._disposeFns.push(callback);
  }

  withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void {
    this._interceptors.register(name, interceptor);
  }

  cascade<TInstance>(definition: Definition<TInstance, LifeTime.scoped, []>): void {
    this._bindingsRegistry.addCascadingBinding(definition.bind(this._currentContainer));
  }

  init(initializer: InitFn): void {
    initializer(this._currentContainer);
  }

  bindCascading<TInstance, TLifeTime extends ContainerConfigureCascadingLifeTimes>(
    definition: IDefinition<TInstance, TLifeTime, []>,
  ): Binder<TInstance, TLifeTime, []> {
    return new Binder<TInstance, TLifeTime, []>(
      definition,
      this._onCascadingStaticBind,
      this._onCascadingInstantiableBind,
    );
  }

  bind<TInstance, TLifeTime extends ContainerConfigureLocalLifeTimes, TArgs extends unknown[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    if ((definition.strategy as LifeTime) === LifeTime.singleton) {
      throw new Error(`Singleton is not allowed for local bindings.`);
    }

    return new Binder<TInstance, TLifeTime, TArgs>(definition, this._onLocalStaticBind, this._onLocalInstantiableBind);
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends unknown[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    return new Binder<TInstance, TLifeTime, TArgs>(
      definition,
      this._onFrozenStaticBind,
      this._onFrozenInstantiableBind,
    );
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

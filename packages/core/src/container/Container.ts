import { v4 } from 'uuid';

import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import type { ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';
import { configureContainer } from '../configuration/ContainerConfiguration.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import { configureScope } from '../configuration/ScopeConfiguration.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import type { MaybePromise } from '../utils/async.js';
import { maybePromiseAll } from '../utils/async.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/IContainerConfigurable.js';
import type { IDefinitionSymbol } from '../definitions/def-symbol.js';
import type { InstancesArray } from '../definitions/abstract/InstanceDefinition.js';
import { ModifyDefinitionBuilder } from '../configuration/dsl/new/shared/ModifyDefinitionBuilder.js';
import { ContainerFreezeConfigurationContext } from '../configuration/dsl/new/shared/context/ContainerFreezeConfigurationContext.js';
import type {
  ContainerConfiguration,
  ScopeConfiguration,
} from '../configuration/dsl/new/container/ContainerConfiguration.js';
import type { ILifeCycleRegistry } from '../lifecycle/ILifeCycleRegistry.js';
import { ContainerLifeCycleRegistry } from '../lifecycle/ILifeCycleRegistry.js';

import type {
  ICascadingDefinitionResolver,
  IContainer,
  IContainerFactory,
  IStrategyAware,
  UseFn,
} from './IContainer.js';
import type { IInterceptor } from './interceptors/interceptor.js';
import { InterceptorsRegistry } from './interceptors/InterceptorsRegistry.js';
import { SingletonStrategy } from './strategies/SingletonStrategy.js';
import { ScopedStrategy } from './strategies/ScopedStrategy.js';

export interface Container extends UseFn<LifeTime> {}

const containerAllowedScopes = [LifeTime.scoped, LifeTime.singleton, LifeTime.transient, LifeTime.cascading];

export class Container
  extends ExtensibleFunction
  implements IContainer, ICascadingDefinitionResolver, IContainerFactory
{
  static root(): Container {
    return new Container(
      null,
      BindingsRegistry.create(),
      InstancesStore.create(),
      InterceptorsRegistry.create(),
      null,
      [],
      new ContainerLifeCycleRegistry(),
    );
  }

  public readonly id = v4();

  private _isDisposed = false;

  private _singletonStrategy: SingletonStrategy;
  private _scopedStrategy: ScopedStrategy;

  protected constructor(
    public readonly parentId: string | null,
    protected readonly bindingsRegistry: BindingsRegistry,
    protected readonly instancesStore: InstancesStore,
    protected readonly interceptorsRegistry: InterceptorsRegistry,
    protected readonly currentInterceptor: IInterceptor<any> | null,
    protected readonly scopeTags: (string | symbol)[],
    protected readonly lifecycleRegistry: ILifeCycleRegistry,
  ) {
    super(
      <TInstance, TLifeTime extends ValidDependenciesLifeTime<LifeTime>>(
        definition: IDefinition<TInstance, TLifeTime>,
      ) => {
        return this.use(definition);
      },
    );

    this._singletonStrategy = new SingletonStrategy(instancesStore, bindingsRegistry);
    this._scopedStrategy = new ScopedStrategy(instancesStore, bindingsRegistry);
  }

  dispose() {
    if (this._isDisposed) {
      return;
    }

    this._isDisposed = true;

    this.lifecycleRegistry.dispose(this);

    if (this.parentId === null) {
      this.instancesStore.disposeRoot();
    }

    this.instancesStore.disposeCurrent();
  }

  new(...configurations: Array<ContainerConfiguration | ContainerConfigureFn>): IContainer {
    const bindingsRegistry = BindingsRegistry.create();
    const instancesStore = InstancesStore.create();
    const interceptorsRegistry = new InterceptorsRegistry();
    const lifeCycleRegistry = new ContainerLifeCycleRegistry();

    const cnt = new Container(
      null,
      bindingsRegistry,
      instancesStore,
      interceptorsRegistry,
      null,
      [],
      lifeCycleRegistry,
    );

    if (configurations.length) {
      const configs = configurations.map(config => {
        if (config instanceof Function) {
          return configureContainer(config);
        } else {
          return config;
        }
      });

      configs.forEach((config: ContainerConfiguration) =>
        config.apply(bindingsRegistry, cnt, interceptorsRegistry, lifeCycleRegistry),
      );

      const interceptor = interceptorsRegistry.build();

      interceptor?.configureRoot?.(bindingsRegistry, instancesStore);

      // binder.toConfig().apply(bindingsRegistry, cnt);

      return interceptor ? cnt.withInterceptor(interceptor) : cnt;
    }

    return cnt;
  }

  scope<TConfigureFns extends Array<ScopeConfigureFn | ScopeConfiguration>>(
    ...configureFns: TConfigureFns
  ): IContainer {
    const bindingsRegistry = this.bindingsRegistry.checkoutForScope();
    const instancesStore = this.instancesStore.childScope();
    const tags: (string | symbol)[] = [];
    const lifeCycleRegistry = new ContainerLifeCycleRegistry();

    const scopeInterceptorsRegistry = this.interceptorsRegistry.scope(tags, bindingsRegistry, instancesStore);

    const cnt: Container & IStrategyAware = new Container(
      this.id,
      bindingsRegistry,
      instancesStore,
      scopeInterceptorsRegistry,
      scopeInterceptorsRegistry.build() ?? null,
      tags,
      lifeCycleRegistry,
    );

    if (configureFns.length) {
      const configs = configureFns.map(configOrConfigureFn => {
        if (configOrConfigureFn instanceof Function) {
          return configureScope(configOrConfigureFn);
        } else {
          return configOrConfigureFn;
        }
      });

      configs.forEach(config => {
        config.apply(bindingsRegistry, cnt, scopeInterceptorsRegistry, lifeCycleRegistry);
      });

      return cnt;
    }

    return cnt;
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    definition: IDefinitionSymbol<TInstance, TLifeTime>,
  ): ModifyDefinitionBuilder<TInstance, TLifeTime> {
    const configurationContext = new ContainerFreezeConfigurationContext(this.bindingsRegistry, this.instancesStore);

    return new ModifyDefinitionBuilder<TInstance, TLifeTime>(
      'freeze',
      definition,
      containerAllowedScopes,
      configurationContext,
    );
  }

  getInterceptor(id: string | symbol): IInterceptor<any> | undefined {
    return this.interceptorsRegistry?.get(id);
  }

  protected withInterceptor(interceptor: IInterceptor<any>): Container {
    return new Container(
      this.parentId,
      this.bindingsRegistry,
      this.instancesStore,
      this.interceptorsRegistry,
      interceptor,
      this.scopeTags,
      this.lifecycleRegistry,
    );
  }

  use<TValue>(definition: IDefinitionSymbol<TValue, ValidDependenciesLifeTime<LifeTime>>): MaybePromise<TValue> {
    const patchedDefinition = this.bindingsRegistry.getDefinition(definition);

    return this.buildWithStrategy(patchedDefinition);
  }

  useAsync<TValue>(definition: IDefinitionSymbol<TValue, ValidDependenciesLifeTime<LifeTime>>): Promise<TValue> {
    const patchedDefinition = this.bindingsRegistry.getDefinition(definition);

    return Promise.resolve(this.buildWithStrategy(patchedDefinition));
  }

  /**
   * Returns instance if it is already memoized in the root scope or in the current scope. Otherwise, returns null.
   * Cascading instances are returned only from the scope holding the instance.
   * @param definition
   */
  useExisting<TValue>(definition: IDefinitionSymbol<TValue, LifeTime.scoped | LifeTime.singleton>): TValue | null {
    return (this.instancesStore.getExisting(definition) as TValue) ?? null;
  }

  protected buildWithStrategy<TValue>(definition: IDefinition<TValue, LifeTime>): MaybePromise<TValue> {
    if (this._isDisposed) {
      throw new Error(`Container ${this.id} is disposed. You cannot used it for resolving instances anymore.`);
    }

    if (this.currentInterceptor) {
      return this.buildWithStrategyIntercepted(this.currentInterceptor.onEnter(definition), definition);
    } else {
      if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
        return this._singletonStrategy.build(definition, this);
      }

      switch (definition.strategy) {
        case LifeTime.transient:
          return definition.create(this);
        case LifeTime.singleton:
          return this._singletonStrategy.build(definition, this);
        case LifeTime.scoped:
          return this._scopedStrategy.build(definition, this);

        case LifeTime.cascading:
          return (this.bindingsRegistry.getOwningContainer(definition) ?? this).resolveCascading(definition);
      }
    }
  }

  resolveCascading<TValue>(definition: IDefinition<TValue, LifeTime>) {
    return this._scopedStrategy.build(definition, this);
  }

  private buildWithStrategyIntercepted<TValue>(
    currentInterceptor: IInterceptor<any>,
    definition: IDefinition<TValue, LifeTime>,
  ): MaybePromise<TValue> {
    const withChildInterceptor = this.withInterceptor(currentInterceptor);

    if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
      const instance = this._singletonStrategy.build(definition, withChildInterceptor);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.transient) {
      const instance = definition.create(this);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.singleton) {
      const instance = this._singletonStrategy.build(definition, withChildInterceptor);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.scoped) {
      const instance = this._scopedStrategy.build(definition, withChildInterceptor);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.cascading) {
      const instance = (this.bindingsRegistry.getOwningContainer(definition) ?? this).resolveCascading(definition);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    throw new Error(`Unknown strategy: ${definition.strategy}`);
  }

  all<TDefinitions extends Array<IDefinitionSymbol<unknown, ValidDependenciesLifeTime<LifeTime>>>>(
    ...definitions: [...TDefinitions]
  ): MaybePromise<InstancesArray<TDefinitions>> {
    const results = definitions.map(def => this.use(def));

    return maybePromiseAll(results) as MaybePromise<InstancesArray<TDefinitions>>;
  }
}

export const container: IContainer & IContainerFactory = Container.root();

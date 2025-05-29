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
import { isDefinition } from '../definitions/abstract/IDefinition.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/IContainerConfigurable.js';
import type { IDefinitionToken } from '../definitions/tokens.js';
import type { Instance, InstancesArray } from '../definitions/abstract/InstanceDefinition.js';
import { ModifyDefinitionBuilder } from '../configuration/dsl/new/shared/ModifyDefinitionBuilder.js';
import { ContainerFreezeConfigurationContext } from '../configuration/dsl/new/shared/context/ContainerFreezeConfigurationContext.js';
import type { IContainerConfiguration } from '../configuration/dsl/new/container/ContainerConfiguration.js';
import type { ILifeCycleRegistry } from '../lifecycle/ILifeCycleRegistry.js';
import { ContainerLifeCycleRegistry } from '../lifecycle/ILifeCycleRegistry.js';
import { MaybeAsync } from '../utils/MaybeAsync.js';
import { COWMap } from '../context/COWMap.js';

import type { HasPromise, ICascadingDefinitionResolver, IContainer, IStrategyAware, UseFn } from './IContainer.js';
import type { ICompositeInterceptor, IInterceptor, InterceptorClass } from './interceptors/interceptor.js';
import { SingletonStrategy } from './strategies/SingletonStrategy.js';
import { ScopedStrategy } from './strategies/ScopedStrategy.js';
import { CompositeInterceptor, PassThroughInterceptor } from './interceptors/CompositeInterceptor.js';

export interface Container extends UseFn<LifeTime> {}

const containerAllowedScopes = [LifeTime.scoped, LifeTime.singleton, LifeTime.transient, LifeTime.cascading];

export type ContainerAllReturn<TDefinitions extends Array<IDefinitionToken<any, ValidDependenciesLifeTime<LifeTime>>>> =
  HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions>;

export type AwaitedInstance<T extends IDefinitionToken<Promise<any>, any>> =
  T extends IDefinitionToken<Promise<infer TInstance>, any> ? TInstance : Instance<T>;

export type AwaitedInstanceArray<T extends Array<IDefinitionToken<Promise<any>, any>>> = {
  [K in keyof T]: AwaitedInstance<T[K]>;
};

export class Container extends ExtensibleFunction implements IContainer, ICascadingDefinitionResolver {
  static create(...configurations: Array<IContainerConfiguration | ContainerConfigureFn>): IContainer {
    const configs = configurations.map(config => {
      if (config instanceof Function) {
        return configureContainer(config);
      } else {
        return config;
      }
    });

    const bindingsRegistry = BindingsRegistry.create(configs);
    const instancesStore = InstancesStore.create();
    const lifeCycleRegistry = new ContainerLifeCycleRegistry();
    const cascadingRoots = COWMap.create<ICascadingDefinitionResolver>();

    const cnt = new Container(
      null,
      bindingsRegistry,
      instancesStore,
      cascadingRoots,
      lifeCycleRegistry,
      PassThroughInterceptor.instance,
    );

    configs.forEach((config: IContainerConfiguration) => {
      // bindingsRegistry.applyConfig(config, cnt);
      lifeCycleRegistry.append(config.lifeCycleRegistry);

      if (config.interceptors) {
        cnt.applyInterceptors(config.interceptors);
      }

      config.cascadingTokens.forEach(token => {
        cascadingRoots.set(token.id, cnt);

        // if (token instanceof AbstractDefinition) {
        //   bindingsRegistry.override(token);
        // }
      });
    });

    return cnt;
  }

  public readonly id = v4();

  private _isDisposed = false;

  private _singletonStrategy: SingletonStrategy;
  private _scopedStrategy: ScopedStrategy;

  protected constructor(
    public readonly parentId: string | null,
    protected readonly bindingsRegistry: BindingsRegistry,
    protected readonly instancesStore: InstancesStore,
    protected readonly cascadingRoots: COWMap<ICascadingDefinitionResolver>,
    protected readonly lifecycleRegistry: ILifeCycleRegistry,
    private _interceptor: ICompositeInterceptor,
  ) {
    // TODO: remove
    super(
      <TInstance, TLifeTime extends ValidDependenciesLifeTime<LifeTime>>(
        definition: IDefinitionToken<TInstance, TLifeTime>,
      ) => {
        return this.resolve(definition);
      },
    );

    this._singletonStrategy = new SingletonStrategy(instancesStore);
    this._scopedStrategy = new ScopedStrategy(instancesStore);
  }

  dispose(): MaybeAsync<void> {
    if (this._isDisposed) {
      return MaybeAsync.resolve(undefined);
    }

    this._isDisposed = true;

    return MaybeAsync.resolve(this.lifecycleRegistry.dispose(this)).then(() => {
      if (this.parentId === null) {
        this.instancesStore.disposeRoot();
      }

      this.instancesStore.disposeCurrent();
    });
  }

  protected applyInterceptors(interceptor: Set<InterceptorClass<IInterceptor>>): void {
    if (this._interceptor instanceof PassThroughInterceptor) {
      this._interceptor = new CompositeInterceptor();
    }

    interceptor.forEach(interceptorClass => {
      const interceptorInstance = interceptorClass.create();

      this._interceptor.append(interceptorInstance);
    });
  }

  scope<TConfigureFns extends Array<ScopeConfigureFn | IContainerConfiguration>>(
    ...configurations: TConfigureFns
  ): IContainer {
    const configs = configurations.map(configOrConfigureFn => {
      if (configOrConfigureFn instanceof Function) {
        return configureScope(configOrConfigureFn);
      } else {
        return configOrConfigureFn;
      }
    });

    const bindingsRegistry = this.bindingsRegistry.checkoutForScope(configs);
    const instancesStore = this.instancesStore.childScope();

    const lifeCycleRegistry = new ContainerLifeCycleRegistry();
    const cascadingRoots = this.cascadingRoots.clone();

    const cnt: Container & IStrategyAware = new Container(
      this.id,
      bindingsRegistry,
      instancesStore,
      cascadingRoots,
      lifeCycleRegistry,
      this._interceptor.onScope(),
    );

    configs.forEach(config => {
      // bindingsRegistry.applyConfig(config, cnt);
      lifeCycleRegistry.append(config.lifeCycleRegistry);

      if (config.interceptors) {
        cnt.applyInterceptors(config.interceptors);
      }

      config.cascadingTokens.forEach(token => {
        cascadingRoots.set(token.id, cnt);
      });
    });

    return cnt;
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    definition: IDefinitionToken<TInstance, TLifeTime>,
  ): ModifyDefinitionBuilder<TInstance, TLifeTime> {
    const configurationContext = new ContainerFreezeConfigurationContext(this.bindingsRegistry, this.instancesStore);

    return new ModifyDefinitionBuilder<TInstance, TLifeTime>(
      'freeze',
      definition,
      containerAllowedScopes,
      configurationContext,
    );
  }

  hasInterceptor(interceptorClass: InterceptorClass<IInterceptor>): boolean {
    return this._interceptor.findInstance(interceptorClass) !== undefined;
  }

  getInterceptor<TInstance extends IInterceptor>(cls: InterceptorClass<TInstance>): TInstance {
    const interceptorInstance = this._interceptor?.findInstance(cls);

    if (!interceptorInstance) {
      throw new Error(`Interceptor with class ${(cls as any).name} not found.`);
    }

    return interceptorInstance;
  }

  has(definition: IDefinitionToken<unknown, LifeTime>): boolean {
    // if (definition instanceof AbstractDefinition) {
    //   return true;
    // }

    return Boolean(
      this.bindingsRegistry.findByToken(definition) ?? this.bindingsRegistry.hasLazyDefinition(definition),
    );
  }

  use<TValue>(definition: IDefinitionToken<TValue, ValidDependenciesLifeTime<LifeTime>>): TValue {
    return this.resolve(definition).value as TValue;
  }

  resolve<TValue>(definition: IDefinitionToken<TValue, ValidDependenciesLifeTime<LifeTime>>): MaybeAsync<TValue> {
    if (isDefinition(definition)) {
      const override = this.bindingsRegistry.findForDefinition(definition);

      if (definition.strategy === LifeTime.cascading) {
        // if we don't have any cascading root for the definition in the whole containers hierarchy,
        // we set the current container as a cascading root for this definition
        if (!this.cascadingRoots.has(definition.id)) {
          this.cascadingRoots.set(definition.id, this);
        }
      }

      return this.buildWithStrategy(override ?? definition);
    }

    const patchedDefinition = this.bindingsRegistry.getByToken(definition);

    return this.buildWithStrategy(patchedDefinition);
  }

  useAsync<TValue>(definition: IDefinitionToken<TValue, ValidDependenciesLifeTime<LifeTime>>): Promise<TValue> {
    const patchedDefinition = this.bindingsRegistry.getByToken(definition);

    return Promise.resolve(this.buildWithStrategy(patchedDefinition));
  }

  /**
   * Returns instance if it is already memoized in the root scope or in the current scope. Otherwise, returns null.
   * Cascading instances are returned only from the scope holding the instance.
   * @param definition
   */
  useExisting<TValue>(definition: IDefinitionToken<TValue, LifeTime>): MaybeAsync<TValue | null> {
    return this.instancesStore.getExisting(definition);
  }

  protected buildWithStrategy<TValue>(definition: IDefinition<TValue, LifeTime>): MaybeAsync<TValue> {
    if (this._isDisposed) {
      throw new Error(`Container ${this.id} is disposed. You cannot used it for resolving instances anymore.`);
    }

    if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
      return this._singletonStrategy.build(definition, this, this._interceptor);
    }

    switch (definition.strategy) {
      case LifeTime.transient:
        return definition.create(this, this._interceptor);
      case LifeTime.singleton:
        return this._singletonStrategy.build(definition, this, this._interceptor);
      case LifeTime.scoped:
        return this._scopedStrategy.build(definition, this, this._interceptor);
      case LifeTime.cascading:
        return (this.cascadingRoots.get(definition.id) ?? this).resolveCascading(definition);
    }
  }

  resolveCascading<TValue>(definition: IDefinition<TValue, LifeTime>) {
    return this._scopedStrategy.build(definition, this, this._interceptor);
  }

  resolveAll<TDefinitions extends Array<IDefinitionToken<unknown, ValidDependenciesLifeTime<LifeTime>>>>(
    ...definitions: [...TDefinitions]
  ): MaybeAsync<InstancesArray<TDefinitions>> {
    const results = definitions.map(def => this.use(def));

    return MaybeAsync.all(results) as MaybeAsync<InstancesArray<TDefinitions>>;
  }

  all<TDefinitions extends Array<IDefinitionToken<unknown, ValidDependenciesLifeTime<LifeTime>>>>(
    ...definitions: [...TDefinitions]
  ): ContainerAllReturn<TDefinitions> {
    const results = definitions.map(def => this.use(def));

    return MaybeAsync.all(results).value as ContainerAllReturn<TDefinitions>;
  }
}

export const container = Container.create.bind(Container);

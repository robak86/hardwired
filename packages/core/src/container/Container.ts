import { v4 } from 'uuid';

import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import type { AsyncContainerConfigureFn, ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import type { IDefinition } from '../definitions/abstract/IDefinition.js';
import { isDefinition } from '../definitions/abstract/IDefinition.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/IContainerConfigurable.js';
import type { Instance, InstancesArray } from '../definitions/abstract/InstanceDefinition.js';
import { ModifyDefinitionBuilder } from '../configuration/dsl/new/shared/ModifyDefinitionBuilder.js';
import { ContainerFreezeConfigurationContext } from '../configuration/dsl/new/shared/context/ContainerFreezeConfigurationContext.js';
import type { IContainerConfiguration } from '../configuration/dsl/new/container/ContainerConfiguration.js';
import type { ILifeCycleRegistry } from '../lifecycle/ILifeCycleRegistry.js';
import { ContainerLifeCycleRegistry } from '../lifecycle/ILifeCycleRegistry.js';
import type { UnwrapMaybePromise } from '../utils/MaybeAsync.js';
import { MaybeAsync } from '../utils/MaybeAsync.js';
import { ContainerConfigurationBuilder } from '../configuration/dsl/new/container/ContainerConfigurationBuilder.js';
import { ScopeConfigurationBuilder } from '../configuration/dsl/new/scope/ScopeConfigurationBuilder.js';
import type { IDefinitionToken } from '../definitions/DefinitionToken.js';
import { HierarchicalMap } from '../context/HierarchicalMap.js';

import type {
  HasPromise,
  ICascadingDefinitionResolver,
  IContainer,
  IDependenciesResolver,
  ReturnTypes,
  UseFn,
} from './IContainer.js';
import type { ICompositeInterceptor, IInterceptor, InterceptorClass } from './interceptors/interceptor.js';
import { SingletonStrategy } from './strategies/SingletonStrategy.js';
import { ScopedStrategy } from './strategies/ScopedStrategy.js';
import { CompositeInterceptor, PassThroughInterceptor } from './interceptors/CompositeInterceptor.js';
import { CascadingStrategy } from './strategies/CascadingStrategy.js';

export interface Container extends UseFn<LifeTime> {}

const containerAllowedScopes = [LifeTime.scoped, LifeTime.singleton, LifeTime.transient, LifeTime.cascading];

export type NewScopeReturnType<
  TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>,
  TAllowedLifeTime extends LifeTime = LifeTime,
> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true
    ? Promise<IContainer<TAllowedLifeTime>>
    : IContainer<TAllowedLifeTime>;

export type ContainerNewReturnType<
  TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>,
  TAllowedLifeTime extends LifeTime = LifeTime,
> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true
    ? Promise<IContainer<TAllowedLifeTime>>
    : IContainer<TAllowedLifeTime>;

export type ContainerAllReturn<TDefinitions extends Array<IDefinitionToken<any, ValidDependenciesLifeTime<LifeTime>>>> =
  HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions>;

export type AwaitedInstance<T extends IDefinitionToken<Promise<any>, any>> =
  T extends IDefinitionToken<Promise<infer TInstance>, any> ? TInstance : Instance<T>;

export type AwaitedInstanceArray<T extends Array<IDefinitionToken<UnwrapMaybePromise<any>, any>>> = {
  [K in keyof T]: AwaitedInstance<T[K]>;
};

export class Container implements IContainer, ICascadingDefinitionResolver, IDependenciesResolver {
  static create<TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>>(
    ...configurations: TConfigureFns
  ): ContainerNewReturnType<TConfigureFns> {
    const _configs: MaybeAsync<IContainerConfiguration>[] = configurations.map(configOrConfigureFn => {
      const builder = new ContainerConfigurationBuilder();

      return MaybeAsync.resolve(configOrConfigureFn(builder)).then(() => builder.toConfig());
    });

    return MaybeAsync.all(_configs)
      .then(configs => {
        const bindingsRegistry = BindingsRegistry.create(configs);
        const instancesStore = InstancesStore.create();
        const lifeCycleRegistry = new ContainerLifeCycleRegistry();
        const cascadingRoots = HierarchicalMap.create<ICascadingDefinitionResolver>();
        const inheritedTokens = new Set<symbol>();

        const cnt = new Container(
          null,
          bindingsRegistry,
          instancesStore,
          cascadingRoots,
          inheritedTokens,
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
      })
      .unwrap() as unknown as ContainerNewReturnType<TConfigureFns>;
  }

  public readonly id = v4();

  private _isDisposed = false;

  private _singletonStrategy: SingletonStrategy;
  private _scopedStrategy: ScopedStrategy;
  private _cascadingStrategy: CascadingStrategy;

  protected constructor(
    private _parent: (IContainer & ICascadingDefinitionResolver) | null,
    protected readonly bindingsRegistry: BindingsRegistry,
    protected readonly instancesStore: InstancesStore,
    protected readonly cascadingRoots: HierarchicalMap<ICascadingDefinitionResolver>,
    protected readonly inheritedTokens: Set<symbol>,
    protected readonly lifecycleRegistry: ILifeCycleRegistry,
    private _interceptor: ICompositeInterceptor,
  ) {
    this._singletonStrategy = new SingletonStrategy(instancesStore);
    this._scopedStrategy = new ScopedStrategy(instancesStore);
    this._cascadingStrategy = new CascadingStrategy(instancesStore, bindingsRegistry, inheritedTokens, cascadingRoots);
  }

  get parentId() {
    return this._parent ? this._parent.id : null;
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

  scope<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
    ...configureFns: TConfigureFns
  ): NewScopeReturnType<TConfigureFns> {
    const configs: MaybeAsync<IContainerConfiguration>[] = configureFns.map(configOrConfigureFn => {
      const builder = new ScopeConfigurationBuilder();

      return MaybeAsync.resolve(configOrConfigureFn(builder, this)).then(() => builder.toConfig());
    });

    return MaybeAsync.all(configs)
      .then(configs => {
        const bindingsRegistry = this.bindingsRegistry.checkoutForScope(configs);
        const instancesStore = this.instancesStore.childScope();

        const lifeCycleRegistry = new ContainerLifeCycleRegistry();
        const cascadingRoots = this.cascadingRoots.child();

        const inheritedTokens = new Set<symbol>(this.inheritedTokens);

        const cnt: Container = new Container(
          this,
          bindingsRegistry,
          instancesStore,
          cascadingRoots,
          inheritedTokens,
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

          config.inheritedTokens.forEach(token => {
            inheritedTokens.add(token.id);
          });
        });

        return cnt;
      })
      .unwrap() as unknown as NewScopeReturnType<TConfigureFns>;
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    definition: IDefinitionToken<TInstance, TLifeTime>,
  ): ModifyDefinitionBuilder<TInstance, TLifeTime, []> {
    const configurationContext = new ContainerFreezeConfigurationContext(this.bindingsRegistry, this.instancesStore);

    return new ModifyDefinitionBuilder<TInstance, TLifeTime, []>(
      'freeze',
      definition,
      containerAllowedScopes,
      configurationContext,
      [],
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
    return this.resolve(definition).unwrap() as TValue;
  }

  resolve<TValue>(definition: IDefinitionToken<TValue, ValidDependenciesLifeTime<LifeTime>>): MaybeAsync<TValue> {
    if (this.instancesStore.has(definition)) {
      return this.instancesStore.get(definition.id) as MaybeAsync<TValue>;
    }

    if (isDefinition(definition)) {
      const override = this.bindingsRegistry.findForDefinition(definition);

      if (definition.strategy === LifeTime.cascading) {
        // When resolving cascading definition, we don't have a container root for that definition during
        // container/scope creation compared to tokens for which the definition is set. Therefore, we need to lazily
        // set the cascading root here.

        // If there is no cascading root for the definition in the whole hierarchy, we set cascading root to the root container.
        // Otherwise, we already know which container use for resolving cascading definition as it is set in the
        // cascadingRoots phase.
        if (!this.cascadingRoots.has(definition.id)) {
          this.cascadingRoots.setForRoot(definition.id, this);
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
  useExisting<TValue>(definition: IDefinitionToken<TValue, LifeTime>): TValue | null {
    return this.instancesStore.getExisting(definition).unwrap() as TValue | null;
  }

  resolveCascading<TValue>(definition: IDefinition<TValue, LifeTime>) {
    return this._scopedStrategy.build(definition, this, this._interceptor);
  }

  resolveAll<TDefinitions extends Array<IDefinitionToken<unknown, ValidDependenciesLifeTime<LifeTime>>>>(
    ...definitions: [...TDefinitions]
  ): MaybeAsync<InstancesArray<TDefinitions>> {
    const results = definitions.map(def => this.resolve(def));

    return MaybeAsync.all(results) as MaybeAsync<InstancesArray<TDefinitions>>;
  }

  all<TDefinitions extends Array<IDefinitionToken<unknown, ValidDependenciesLifeTime<LifeTime>>>>(
    ...definitions: [...TDefinitions]
  ): ContainerAllReturn<TDefinitions> {
    const results = definitions.map(def => this.resolve(def));

    return MaybeAsync.all(results).unwrap() as ContainerAllReturn<TDefinitions>;
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
        return this._cascadingStrategy.build(definition, this._parent, this);
    }
  }
}

export const container = Container.create.bind(Container);

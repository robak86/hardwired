import { v4 } from 'uuid';

import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import type { AsyncContainerConfigureFn, ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import { ScopeConfigurationDSL } from '../configuration/dsl/ScopeConfigurationDSL.js';
import { ContainerConfigurationDSL } from '../configuration/dsl/ContainerConfigurationDSL.js';
import type { AnyDefinitionSymbol, IDefinition } from '../definitions/abstract/IDefinition.js';
import type { MaybePromise } from '../utils/async.js';
import { maybePromiseAll, maybePromiseAllThen } from '../utils/async.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/ContainerConfigurable.js';
import { Binder } from '../configuration/Binder.js';
import type { IDefinitionSymbol } from '../definitions/def-symbol.js';
import type { InstancesArray } from '../definitions/abstract/InstanceDefinition.js';

import type { HasPromise, IContainer, IStrategyAware, NewScopeReturnType, ReturnTypes, UseFn } from './IContainer.js';
import type { IInterceptor } from './interceptors/interceptor.js';
import { InterceptorsRegistry } from './interceptors/InterceptorsRegistry.js';

export interface Container extends UseFn<LifeTime> {}

export type ContainerNewReturnType<TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true ? Promise<Container> : Container;

export class Container extends ExtensibleFunction implements IContainer {
  static root(): Container {
    return new Container(
      null,
      BindingsRegistry.create(),
      InstancesStore.create(),
      InterceptorsRegistry.create(),
      null,
      [],
    );
  }

  public readonly id = v4();

  private _isDisposed = false;

  constructor(
    public readonly parentId: string | null,
    protected readonly bindingsRegistry: BindingsRegistry,
    protected readonly instancesStore: InstancesStore,
    protected readonly interceptorsRegistry: InterceptorsRegistry,
    protected readonly currentInterceptor: IInterceptor<any> | null,
    protected readonly scopeTags: (string | symbol)[],
    protected readonly _disposableFns: Array<(container: IContainer) => void> = [],
  ) {
    super(
      <TInstance, TLifeTime extends ValidDependenciesLifeTime<LifeTime>>(
        definition: IDefinition<TInstance, TLifeTime>,
      ) => {
        return this.use(definition);
      },
    );
  }

  dispose() {
    if (this._isDisposed) {
      return;
    }

    this._isDisposed = true;

    this._disposableFns.forEach(dispose => dispose(this));

    if (this.parentId === null) {
      this.instancesStore.disposeRoot();
    }

    this.instancesStore.disposeCurrent();
  }

  new<TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>>(
    ...configureFns: TConfigureFns
  ): ContainerNewReturnType<TConfigureFns> {
    const bindingsRegistry = BindingsRegistry.create();
    const instancesStore = InstancesStore.create();
    const interceptorsRegistry = new InterceptorsRegistry();
    const disposableFns: Array<(container: IContainer) => void> = [];

    const cnt = new Container(null, bindingsRegistry, instancesStore, interceptorsRegistry, null, [], disposableFns);

    if (configureFns.length) {
      const binder = new ContainerConfigurationDSL(bindingsRegistry, cnt, interceptorsRegistry, disposableFns);
      const configs = configureFns.map(configureFn => configureFn(binder));

      return maybePromiseAllThen(configs, () => {
        const interceptor = interceptorsRegistry.build();

        interceptor?.configureRoot?.(bindingsRegistry, instancesStore);

        return interceptor ? cnt.withInterceptor(interceptor) : cnt;
      }) as ContainerNewReturnType<TConfigureFns>;
    }

    return cnt as ContainerNewReturnType<TConfigureFns>;
  }

  scope<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
    ...configureFns: TConfigureFns
  ): NewScopeReturnType<TConfigureFns> {
    const bindingsRegistry = this.bindingsRegistry.checkoutForScope();
    const instancesStore = this.instancesStore.childScope();
    const tags: (string | symbol)[] = [];
    const disposableFns: Array<(container: IContainer) => void> = [];

    const scopeInterceptorsRegistry = this.interceptorsRegistry.scope(tags, bindingsRegistry, instancesStore);

    const cnt: Container & IStrategyAware = new Container(
      this.id,
      bindingsRegistry,
      instancesStore,
      scopeInterceptorsRegistry,
      scopeInterceptorsRegistry.build() ?? null,
      tags,
      disposableFns,
    );

    if (configureFns.length) {
      const binder = new ScopeConfigurationDSL(cnt, bindingsRegistry, tags, disposableFns);

      const configs = configureFns.map(configureFn => {
        return configureFn(binder, this);
      });

      return maybePromiseAllThen(configs, () => cnt) as unknown as NewScopeReturnType<TConfigureFns>;
    }

    return cnt as unknown as NewScopeReturnType<TConfigureFns>;
  }

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes>(
    definition: IDefinition<TInstance, TLifeTime>,
  ): Binder<TInstance, TLifeTime> {
    const bind = (definition: IDefinition<TInstance, TLifeTime>) => {
      if (this.instancesStore.has(definition.id)) {
        throw new Error(`Cannot freeze binding ${definition.name} because it is already instantiated.`);
      }

      if (
        this.bindingsRegistry.inheritsCascadingDefinition(definition.id) &&
        this.instancesStore.hasInherited(definition.id)
      ) {
        throw new Error(
          `Cannot freeze cascading binding ${definition.name} because it is already instantiated in some higher scope.`,
        );
      }

      this.bindingsRegistry.addFrozenBinding(definition);
    };

    return new Binder<TInstance, TLifeTime>(
      definition,
      [LifeTime.singleton, LifeTime.transient, LifeTime.scoped],
      bind,
      bind,
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
    );
  }

  use<TValue>(definition: IDefinitionSymbol<TValue, ValidDependenciesLifeTime<LifeTime>>): MaybePromise<TValue> {
    const patchedDefinition = this.bindingsRegistry.getDefinition(definition);

    return this.buildWithStrategy(patchedDefinition);
  }

  /**
   * Returns instance if it is already memoized in the root scope or in the current scope. Otherwise, returns null.
   * Cascading instances are returned only from the scope holding the instance.
   * @param definition
   */
  useExisting<TValue>(definition: IDefinitionSymbol<TValue, LifeTime.scoped | LifeTime.singleton>): TValue | null {
    return (this.instancesStore.getExisting(definition.id) as TValue) ?? null;
  }

  buildWithStrategy<TValue>(definition: IDefinition<TValue, LifeTime>): MaybePromise<TValue> {
    if (this._isDisposed) {
      throw new Error(`Container ${this.id} is disposed. You cannot used it for resolving instances anymore.`);
    }

    if (this.currentInterceptor) {
      return this.buildWithStrategyIntercepted(this.currentInterceptor.onEnter(definition), definition);
    } else {
      if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
        return this.instancesStore.upsertIntoRootInstances(definition, this);
      }

      switch (definition.strategy) {
        case LifeTime.transient:
          return definition.create(this);
        case LifeTime.singleton:
          return this.instancesStore.upsertIntoRootInstances(definition, this);
        case LifeTime.scoped:
          return this.instancesStore.upsertIntoScopeInstances(
            definition,
            this,
            this.bindingsRegistry.inheritsCascadingDefinition(definition.id),
          );

        case LifeTime.cascading:
          return (this.bindingsRegistry.getOwningContainer(definition) ?? this).resolveCascading(definition);
      }
    }
  }

  protected resolveCascading<TValue>(definition: IDefinition<TValue, LifeTime>) {
    return this.instancesStore.upsertIntoScopeInstances(
      definition,
      this,
      this.bindingsRegistry.inheritsCascadingDefinition(definition.id),
    );
  }

  private buildWithStrategyIntercepted<TValue>(
    currentInterceptor: IInterceptor<any>,
    symbol: IDefinitionSymbol<TValue, LifeTime>,
  ): TValue {
    const withChildInterceptor = this.withInterceptor(currentInterceptor);

    const frozenDefinition = this.bindingsRegistry.getFrozenBinding(symbol);

    if (frozenDefinition) {
      const instance = this.instancesStore.upsertIntoRootInstances(frozenDefinition, withChildInterceptor);

      return currentInterceptor.onLeave(instance, symbol) as TValue;
    }

    if (symbol.strategy === LifeTime.transient) {
      const transientDef = this.instancesStore.getTransientDefinition(symbol);

      if (!transientDef) {
        throw new Error(`Cannot find definition for transient binding ${symbol.name}.`);
      }

      const instance = transientDef.create(this);

      return currentInterceptor.onLeave(instance, transientDef) as TValue;
    }

    if (symbol.strategy === LifeTime.singleton) {
      const singletonDef = this.instancesStore.getSingletonDefinition(symbol);

      if (!singletonDef) {
        throw new Error(`Cannot find definition for singleton binding ${symbol.name}.`);
      }

      const instance = this.instancesStore.upsertIntoRootInstances(singletonDef, withChildInterceptor);

      return currentInterceptor.onLeave(instance, symbol) as TValue;
    }

    if (symbol.strategy === LifeTime.scoped) {
      const scopedDef = this.instancesStore.getScopedDefinition(symbol);

      const instance = this.instancesStore.upsertIntoScopeInstances(
        symbol,
        withChildInterceptor,
        this.bindingsRegistry.inheritsCascadingDefinition(symbol.id),
      );

      return currentInterceptor.onLeave(instance, symbol) as TValue;
    }

    throw new Error(`Unsupported strategy ${(symbol as AnyDefinitionSymbol).strategy}`);
  }

  all<TDefinitions extends Array<IDefinitionSymbol<any, ValidDependenciesLifeTime<LifeTime>>>>(
    ...definitions: [...TDefinitions]
  ): MaybePromise<InstancesArray<TDefinitions>> {
    const results = definitions.map(def => {
      return this.use(def);
    });

    return maybePromiseAll(results) as MaybePromise<InstancesArray<TDefinitions>>;
  }

  // object<TRecord extends Record<PropertyKey, IDefinitionSymbol<any, any>>>(
  //   object: TRecord,
  // ): ContainerObjectReturn<TRecord> {
  //   const entries = Object.entries(object);
  //   const results = {} as InstancesRecord<any>;
  //   const promises: Promise<void>[] = [];
  //
  //   for (const [key, definition] of entries) {
  //     const instance: unknown = this.use(definition as AnyDefinition);
  //
  //     if (isThenable(instance)) {
  //       promises.push(
  //         instance.then(value => {
  //           results[key] = value;
  //         }),
  //       );
  //     } else {
  //       results[key] = instance;
  //     }
  //   }
  //
  //   if (promises.length > 0) {
  //     return Promise.all(promises).then(() => results) as ContainerObjectReturn<TRecord>;
  //   } else {
  //     return results as ContainerObjectReturn<TRecord>;
  //   }
  // }
}

export const container = Container.root();

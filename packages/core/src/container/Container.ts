import { v4 } from 'uuid';

import type { InstancesRecord } from '../definitions/abstract/InstanceDefinition.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import type { Definition } from '../definitions/impl/Definition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import type { AsyncContainerConfigureFn, ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/InstanceDefinitionDependency.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import { ScopeConfigurationDSL } from '../configuration/dsl/ScopeConfigurationDSL.js';
import { ContainerConfigurationDSL } from '../configuration/dsl/ContainerConfigurationDSL.js';
import { isPromise } from '../utils/IsPromise.js';
import type { AnyDefinition } from '../definitions/abstract/IDefinition.js';
import { maybePromiseAll, maybePromiseAllThen } from '../utils/async.js';
import type { ContainerConfigureFreezeLifeTimes } from '../configuration/abstract/ContainerConfigurable.js';
import { Binder } from '../configuration/Binder.js';

import type {
  ContainerAllReturn,
  ContainerObjectReturn,
  HasPromise,
  IContainer,
  IStrategyAware,
  NewScopeReturnType,
  ReturnTypes,
  UseFn,
} from './IContainer.js';
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
        definition: Definition<TInstance, TLifeTime, []>,
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

  freeze<TInstance, TLifeTime extends ContainerConfigureFreezeLifeTimes, TArgs extends unknown[]>(
    definition: Definition<TInstance, TLifeTime, TArgs>,
  ): Binder<TInstance, TLifeTime, TArgs> {
    const bind = (definition: Definition<TInstance, TLifeTime, TArgs>) => {
      if (this.instancesStore.has(definition.id)) {
        throw new Error(`Cannot freeze binding ${definition.name} because it is already instantiated.`);
      }

      if (
        this.bindingsRegistry.inheritsCascadingDefinition(definition.id) &&
        this.instancesStore.hasInherited(definition.id)
      ) {
        throw new Error(
          `Cannot freeze cascading binding ${definition.name} because it is already instantiated in some ascendant scope.`,
        );
      }

      this.bindingsRegistry.addFrozenBinding(definition);
    };

    return new Binder<TInstance, TLifeTime, TArgs>(definition, bind, bind);
  }

  // apply<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
  //   ...configureFns: TConfigureFns
  // ): ApplyReturnType<TConfigureFns> {
  //   this.bindingsRegistry = this.bindingsRegistry.checkoutForScope(); // TODO: really checkout ?
  //   this.instancesStore = this.instancesStore.childScope(); // really child scope ?
  //
  //   this.scopeTags = [];
  //   const disposableFns: Array<(container: IContainer) => void> = [];
  //
  //   const scopeInterceptorsRegistry = this.interceptorsRegistry.scope(
  //     this.scopeTags,
  //     this.bindingsRegistry,
  //     this.instancesStore,
  //   );
  //
  //   this.interceptorsRegistry = scopeInterceptorsRegistry;
  //   this.currentInterceptor = scopeInterceptorsRegistry.build() ?? null;
  //
  //   if (configureFns.length) {
  //     const binder = new ScopeConfigurationDSL(this, this.bindingsRegistry, this.scopeTags, disposableFns);
  //
  //     const configs = configureFns.map(configureFn => {
  //       return configureFn(binder, this);
  //     });
  //
  //     return maybePromiseAllThen(configs, () => undefined) as unknown as ApplyReturnType<TConfigureFns>;
  //   }
  //
  //   return undefined as unknown as ApplyReturnType<TConfigureFns>;
  // }

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

  use<TValue>(definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, []>): TValue {
    const patchedDefinition = this.bindingsRegistry.getDefinition(definition);

    return this.buildWithStrategy(patchedDefinition);
  }

  call<TValue, TArgs extends any[]>(definition: Definition<TValue, LifeTime.transient, TArgs>, ...args: TArgs): TValue {
    const patchedDefinition = this.bindingsRegistry.getDefinition(definition);

    return this.buildWithStrategy(patchedDefinition, ...args);
  }

  /**
   * Returns instance if it is already memoized in the root scope or in the current scope. Otherwise, returns null.
   * Cascading instances are returned only from the scope holding the instance.
   * @param definition
   */
  useExisting<TValue>(definition: Definition<TValue, LifeTime.scoped | LifeTime.singleton, []>): TValue | null {
    return (this.instancesStore.getExisting(definition.id) as TValue) ?? null;
  }

  buildWithStrategy<TValue, TArgs extends any[]>(
    definition: Definition<TValue, LifeTime, TArgs>,
    ...args: TArgs
  ): TValue {
    if (this._isDisposed) {
      throw new Error(`Container ${this.id} is disposed. You cannot used it for resolving instances anymore.`);
    }

    if (this.currentInterceptor) {
      return this.buildWithStrategyIntercepted(this.currentInterceptor.onEnter(definition, args), definition, ...args);
    } else {
      if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
        return this.instancesStore.upsertIntoRootInstances(definition, this, ...args);
      }

      switch (definition.strategy) {
        case LifeTime.transient:
          return definition.create(this, ...args);
        case LifeTime.singleton:
          return this.instancesStore.upsertIntoRootInstances(definition, this, ...args);
        case LifeTime.scoped:
          return this.instancesStore.upsertIntoScopeInstances(
            definition,
            this,
            this.bindingsRegistry.inheritsCascadingDefinition(definition.id),
            ...args,
          );
      }
    }
  }

  private buildWithStrategyIntercepted<TValue, TArgs extends any[]>(
    currentInterceptor: IInterceptor<any>,
    definition: Definition<TValue, LifeTime, TArgs>,
    ...args: TArgs
  ): TValue {
    const withChildInterceptor = this.withInterceptor(currentInterceptor);

    if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
      const instance = this.instancesStore.upsertIntoRootInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.transient) {
      const instance = definition.create(this, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.singleton) {
      const instance = this.instancesStore.upsertIntoRootInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.scoped) {
      const instance = this.instancesStore.upsertIntoScopeInstances(
        definition,
        withChildInterceptor,
        this.bindingsRegistry.inheritsCascadingDefinition(definition.id),
        ...args,
      );

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    throw new Error(`Unsupported strategy ${(definition as AnyDefinition).strategy}`);
  }

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): ContainerAllReturn<TDefinitions> {
    const results = definitions.map(def => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.use(def);
    });

    return maybePromiseAll(results) as ContainerAllReturn<TDefinitions>;
  }

  object<TRecord extends Record<PropertyKey, Definition<any, any, any>>>(
    object: TRecord,
  ): ContainerObjectReturn<TRecord> {
    const entries = Object.entries(object);
    const results = {} as InstancesRecord<any>;
    const promises: Promise<void>[] = [];

    for (const [key, definition] of entries) {
      const instance: unknown = this.use(definition as AnyDefinition);

      if (isPromise(instance)) {
        promises.push(
          instance.then(value => {
            results[key] = value;
          }),
        );
      } else {
        results[key] = instance;
      }
    }

    if (promises.length > 0) {
      return Promise.all(promises).then(() => results) as ContainerObjectReturn<TRecord>;
    } else {
      return results as ContainerObjectReturn<TRecord>;
    }
  }

  defer<TInstance, TArgs extends any[]>(factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>) {
    return (...args: TArgs): TInstance => {
      return this.call(factoryDefinition, ...args);
    };
  }
}

export function once<TInstance>(definition: Definition<TInstance, LifeTime.singleton | LifeTime.scoped, []>): TInstance;
export function once<TInstance, TArgs extends any[]>(
  definition: Definition<TInstance, LifeTime.transient, TArgs>,
  ...args: TArgs
): TInstance;
export function once<TInstance, TArgs extends any[]>(
  definition: Definition<TInstance, LifeTime, TArgs>,
  ...args: TArgs
): TInstance {
  if (definition.strategy === LifeTime.transient) {
    return Container.root().call(definition as Definition<TInstance, LifeTime.transient, TArgs>, ...args);
  } else {
    return Container.root().use(definition as unknown as Definition<TInstance, LifeTime, []>);
  }
}

export const all = <TDefinitions extends Array<Definition<any, LifeTime, []>>>(
  ...definitions: [...TDefinitions]
): ContainerAllReturn<TDefinitions> => {
  return Container.root().all(...definitions) as ContainerAllReturn<TDefinitions>;
};

export const container = Container.root();

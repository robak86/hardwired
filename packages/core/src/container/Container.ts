import { v4 } from 'uuid';

import type { InstancesRecord } from '../definitions/abstract/sync/InstanceDefinition.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import type { AnyDefinition, Definition } from '../definitions/abstract/Definition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import type { AsyncContainerConfigureFn, ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';
import type { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import type { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import { ScopeConfigurationDSL } from '../configuration/dsl/ScopeConfigurationDSL.js';
import { ContainerConfigurationDSL } from '../configuration/dsl/ContainerConfigurationDSL.js';
import { DisposableScopeConfigurationDSL } from '../configuration/dsl/DisposableScopeConfigurationDSL.js';
import type { DisposeFn } from '../configuration/abstract/ContainerConfigurable.js';
import type {
  DisposableAsyncScopeConfigureFn,
  DisposableScopeConfigureFn,
} from '../configuration/DisposableScopeConfiguration.js';
import { isPromise } from '../utils/IsPromise.js';
import type { DefinitionDisposable } from '../utils/ScopesRegistry.js';
import { ScopesRegistry } from '../utils/ScopesRegistry.js';

import type {
  ContainerAllReturn,
  ContainerObjectReturn,
  ContainerRunFn,
  EnsurePromise,
  HasPromise,
  IContainer,
  IContainerScopes,
  IDisposableScopeAware,
  InstanceCreationAware,
  IStrategyAware,
  NewScopeReturnType,
  ReturnTypes,
  UseFn,
} from './IContainer.js';
import { DisposableScope } from './DisposableScope.js';
import type { IInterceptor } from './interceptors/interceptor.js';
import { InterceptorsRegistry } from './interceptors/InterceptorsRegistry.js';

export interface Container extends UseFn<LifeTime> {}

export type ContainerNewReturnType<TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true ? Promise<Container> : Container;

export class Container
  extends ExtensibleFunction
  implements InstanceCreationAware, IContainerScopes, IDisposableScopeAware
{
  public readonly id = v4();

  constructor(
    public readonly parentId: string | null,
    protected readonly bindingsRegistry: BindingsRegistry,
    protected readonly instancesStore: InstancesStore,
    protected readonly interceptorsRegistry: InterceptorsRegistry,
    protected readonly scopesRegistry: ScopesRegistry,
    protected readonly currentInterceptor: IInterceptor<any> | null,
    protected readonly scopeTags: (string | symbol)[],
  ) {
    super(
      <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
        definition: Definition<TInstance, TLifeTime, TArgs>,
        ...args: TArgs
      ) => {
        return this.use(definition, ...args);
      },
    );
  }

  new<TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>>(
    ...configureFns: TConfigureFns
  ): ContainerNewReturnType<TConfigureFns> {
    const bindingsRegistry = BindingsRegistry.create();
    const instancesStore = InstancesStore.create();
    const interceptorsRegistry = new InterceptorsRegistry();
    const disposables: DefinitionDisposable<any>[] = [];
    const scopesRegistry = ScopesRegistry.create();

    const cnt = new Container(null, bindingsRegistry, instancesStore, interceptorsRegistry, scopesRegistry, null, []);

    this.scopesRegistry.register(cnt, disposables);

    if (configureFns.length) {
      const binder = new ContainerConfigurationDSL(
        bindingsRegistry,
        instancesStore,
        cnt,
        interceptorsRegistry,
        disposables,
      );

      const configs = configureFns.map(configureFn => configureFn(binder));
      const hasAsync = configs.some(isPromise);

      if (hasAsync) {
        return Promise.all(configs).then(() => {
          const interceptor = interceptorsRegistry.build();

          interceptor?.configureRoot?.(bindingsRegistry, instancesStore);

          return interceptor ? cnt.withInterceptor(interceptor) : cnt;
        }) as ContainerNewReturnType<TConfigureFns>;
      } else {
        const interceptor = interceptorsRegistry.build();

        interceptor?.configureRoot?.(bindingsRegistry, instancesStore);

        return (interceptor ? cnt.withInterceptor(interceptor) : cnt) as ContainerNewReturnType<TConfigureFns>;
      }
    }

    return cnt as ContainerNewReturnType<TConfigureFns>;
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
      this.scopesRegistry,
      interceptor,
      this.scopeTags,
    );
  }

  use<TValue, TArgs extends any[]>(
    definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    const patchedDefinition = this.bindingsRegistry.getDefinition(definition);

    return this.buildWithStrategy(patchedDefinition, ...args);
  }

  buildWithStrategy<TValue, TArgs extends any[]>(
    definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    if (this.currentInterceptor) {
      return this.buildWithStrategyIntercepted(this.currentInterceptor.onEnter(definition, args), definition, ...args);
    } else {
      if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
        return this.instancesStore.upsertIntoFrozenInstances(definition, this, ...args);
      }

      switch (definition.strategy) {
        case LifeTime.transient:
          return definition.create(this, ...args);
        case LifeTime.singleton:
          return this.instancesStore.upsertIntoGlobalInstances(definition, this, ...args);
        case LifeTime.scoped:
          return this.instancesStore.upsertIntoScopeInstances(definition, this, ...args);
        default:
          throw new Error(`Unsupported strategy ${definition.strategy}`);
      }
    }
  }

  private buildWithStrategyIntercepted<TValue, TArgs extends any[]>(
    currentInterceptor: IInterceptor<any>,
    definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    const withChildInterceptor = this.withInterceptor(currentInterceptor);

    if (this.bindingsRegistry.hasFrozenBinding(definition.id)) {
      const instance = this.instancesStore.upsertIntoFrozenInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.transient) {
      const instance = definition.create(withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.singleton) {
      const instance = this.instancesStore.upsertIntoGlobalInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    if (definition.strategy === LifeTime.scoped) {
      const instance = this.instancesStore.upsertIntoScopeInstances(definition, withChildInterceptor, ...args);

      return currentInterceptor.onLeave(instance, definition) as TValue;
    }

    throw new Error(`Unsupported strategy ${(definition as AnyDefinition).strategy}`);
  }

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): ContainerAllReturn<TDefinitions> {
    const results = definitions.map(def => this.use(def));

    if (results.some(isPromise)) {
      return Promise.all(results) as ContainerAllReturn<TDefinitions>;
    }

    return results as ContainerAllReturn<TDefinitions>;
  }

  object<TRecord extends Record<PropertyKey, Definition<any, any, any>>>(
    object: TRecord,
  ): ContainerObjectReturn<TRecord> {
    const entries = Object.entries(object);
    const results = {} as InstancesRecord<any>;
    const promises: Promise<void>[] = [];

    for (const [key, definition] of entries) {
      const instance = this.use(definition);

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
      return this.use(factoryDefinition, ...args);
    };
  }

  disposable(): DisposableScope;
  disposable(scopeConfigureFn: DisposableAsyncScopeConfigureFn): Promise<DisposableScope>;
  disposable(scopeConfigureFn: DisposableScopeConfigureFn): DisposableScope;
  disposable(
    scopeConfigureFn?: DisposableScopeConfigureFn | DisposableAsyncScopeConfigureFn,
  ): DisposableScope | Promise<DisposableScope> {
    const bindingsRegistry = this.bindingsRegistry.checkoutForScope();
    const instancesStore = this.instancesStore.childScope();
    const tags: (string | symbol)[] = [];

    const cnt = new Container(
      this.id,
      bindingsRegistry,
      instancesStore,
      this.interceptorsRegistry,
      this.scopesRegistry,
      null,
      tags,
    );
    const disposeFns: DisposeFn[] = [];
    const disposable = new DisposableScope(cnt, disposeFns);

    if (scopeConfigureFn) {
      const binder = new DisposableScopeConfigurationDSL(cnt, bindingsRegistry, tags, disposeFns);
      const result = scopeConfigureFn(binder, this);

      if (isPromise(result)) {
        return result.then(() => disposable);
      } else {
        return disposable;
      }
    }

    return disposable;
  }

  scope<TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>>(
    ...configureFns: TConfigureFns
  ): NewScopeReturnType<TConfigureFns> {
    const bindingsRegistry = this.bindingsRegistry.checkoutForScope();
    const instancesStore = this.instancesStore.childScope();
    const tags: (string | symbol)[] = [];

    const scopeInterceptorsRegistry = this.interceptorsRegistry.scope(this.scopeTags, bindingsRegistry, instancesStore);

    const cnt: IContainer & IStrategyAware = new Container(
      this.id,
      bindingsRegistry,
      instancesStore,
      scopeInterceptorsRegistry,
      this.scopesRegistry,
      scopeInterceptorsRegistry.build() ?? null,
      tags,
    );

    if (configureFns.length) {
      const binder = new ScopeConfigurationDSL(cnt, bindingsRegistry, tags);

      const configs = configureFns.map(configureFn => {
        return configureFn(binder, this);
      });

      const hasAsync = configs.some(isPromise);

      if (hasAsync) {
        return Promise.all(configs).then(() => cnt) as NewScopeReturnType<TConfigureFns>;
      } else {
        return cnt as unknown as NewScopeReturnType<TConfigureFns>;
      }
    }

    return cnt as unknown as NewScopeReturnType<TConfigureFns>;
  }

  withScope<TValue>(fn: ContainerRunFn<LifeTime, TValue>): TValue;
  withScope<TValue>(options: AsyncScopeConfigureFn, fn: ContainerRunFn<LifeTime, TValue>): EnsurePromise<TValue>;
  withScope<TValue>(options: ScopeConfigureFn, fn: ContainerRunFn<LifeTime, TValue>): TValue;
  withScope<TValue>(
    configureOrRunFn: ScopeConfigureFn | AsyncScopeConfigureFn | ContainerRunFn<LifeTime, TValue>,
    runFn?: ContainerRunFn<LifeTime, TValue>,
  ): TValue | EnsurePromise<TValue> {
    if (runFn) {
      const configResult = this.scope(configureOrRunFn as ScopeConfigureFn | AsyncScopeConfigureFn);

      if (isPromise(configResult)) {
        return configResult.then(scope => runFn(scope as any)) as EnsurePromise<TValue>;
      } else {
        return runFn(configResult);
      }
    } else {
      return (configureOrRunFn as ContainerRunFn<any, any>)(this.scope());
    }
  }
}

export const once: UseFn<LifeTime> = <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
  definition: Definition<TInstance, TLifeTime, TArgs>,
  ...args: TArgs
): TInstance => {
  const tmpContainer = new Container(
    null,
    BindingsRegistry.create(),
    InstancesStore.create(),
    InterceptorsRegistry.create(),
    ScopesRegistry.create(),
    null,
    [],
  );

  return tmpContainer.use(definition, ...args);
};

export const all: InstanceCreationAware['all'] = (...definitions: any[]) => {
  const tmpContainer = new Container(
    null,
    BindingsRegistry.create(),
    InstancesStore.create(),
    InterceptorsRegistry.create(),
    ScopesRegistry.create(),
    null,
    [],
  );

  return tmpContainer.all(...definitions) as any;
};

export const container = new Container(
  null,
  BindingsRegistry.create(),
  InstancesStore.create(),
  InterceptorsRegistry.create(),
  ScopesRegistry.create(),
  null,
  [],
);

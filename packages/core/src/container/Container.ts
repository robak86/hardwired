import {
  AwaitedInstanceRecord,
  InstancesArray,
  InstancesObject,
  InstancesRecord,
} from '../definitions/abstract/sync/InstanceDefinition.js';
import {
  AwaitedInstanceArray,
  ContainerRunFn,
  EnsurePromise,
  HasPromise,
  IContainer,
  IContainerScopes,
  IDisposableScopeAware,
  InstanceCreationAware,
  ReturnTypes,
  UseFn,
} from './IContainer.js';

import { v4 } from 'uuid';

import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { AsyncContainerConfigureFn, ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import { ScopeConfigurationDSL } from '../configuration/dsl/ScopeConfigurationDSL.js';
import { ContainerConfigurationDSL } from '../configuration/dsl/ContainerConfigurationDSL.js';
import { DisposableScope } from './DisposableScope.js';
import { DisposableScopeConfigurationDSL } from '../configuration/dsl/DisposableScopeConfigurationDSL.js';
import { DisposeFn } from '../configuration/abstract/ContainerConfigurable.js';
import {
  DisposableAsyncScopeConfigureFn,
  DisposableScopeConfigureFn,
} from '../configuration/DisposableScopeConfiguration.js';
import { HasPromiseMember } from '../utils/HasPromiseMember.js';
import { isPromise } from '../utils/IsPromise.js';
import { IInterceptor } from './interceptors/interceptor.js';
import { InterceptorsRegistry } from './interceptors/InterceptorsRegistry.js';

export interface Container extends UseFn<LifeTime> {}

export type ContainerNewReturnType<TConfigureFns extends Array<AsyncContainerConfigureFn | ContainerConfigureFn>> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true ? Promise<Container> : Container;

export type NewScopeReturnType<
  TConfigureFns extends Array<AsyncScopeConfigureFn | ScopeConfigureFn>,
  TAllowedLifeTime extends LifeTime = LifeTime,
> =
  HasPromise<ReturnTypes<TConfigureFns>> extends true
    ? Promise<IContainer<TAllowedLifeTime>>
    : IContainer<TAllowedLifeTime>;

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

    const cnt = new Container(null, bindingsRegistry, instancesStore, interceptorsRegistry, null, []);

    if (configureFns.length) {
      const binder = new ContainerConfigurationDSL(bindingsRegistry, cnt, interceptorsRegistry);

      const configs = configureFns.map(configureFn => configureFn(binder));
      const hasAsync = configs.some(isPromise);

      if (hasAsync) {
        return Promise.all(configs).then(() => {
          const interceptor = interceptorsRegistry.build();
          interceptor?.configureRoot?.(bindingsRegistry, instancesStore);

          return interceptor ? cnt.withInterceptor(interceptor) : cnt;
        }) as any;
      } else {
        const interceptor = interceptorsRegistry.build();
        interceptor?.configureRoot?.(bindingsRegistry, instancesStore);

        return interceptor ? cnt.withInterceptor(interceptor) : (cnt as any);
      }
    }

    return cnt as any;
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

  use<TValue, TArgs extends any[]>(
    definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    const patchedDefinition = this.bindingsRegistry.getDefinition(definition);

    if (this.currentInterceptor) {
      return this.buildWithStrategyIntercepted(
        this.currentInterceptor.onEnter(patchedDefinition, args),
        patchedDefinition,
        ...args,
      );
    } else {
      if (this.bindingsRegistry.hasFrozenBinding(patchedDefinition.id)) {
        return this.instancesStore.upsertIntoFrozenInstances(patchedDefinition, this, ...args);
      }

      switch (patchedDefinition.strategy) {
        case LifeTime.transient:
          return patchedDefinition.create(this, ...args);
        case LifeTime.singleton:
          return this.instancesStore.upsertIntoGlobalInstances(patchedDefinition, this, ...args);
        case LifeTime.scoped:
          return this.instancesStore.upsertIntoScopeInstances(patchedDefinition, this, ...args);
        default:
          throw new Error(`Unsupported strategy ${patchedDefinition.strategy}`);
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
      return currentInterceptor.onLeave(instance, definition);
    }

    if (definition.strategy === LifeTime.transient) {
      const instance = definition.create(withChildInterceptor, ...args);
      return currentInterceptor.onLeave(instance, definition);
    }

    if (definition.strategy === LifeTime.singleton) {
      const instance = this.instancesStore.upsertIntoGlobalInstances(definition, withChildInterceptor, ...args);
      return currentInterceptor.onLeave(instance, definition);
    }

    if (definition.strategy === LifeTime.scoped) {
      const instance = this.instancesStore.upsertIntoScopeInstances(definition, withChildInterceptor, ...args);
      return currentInterceptor.onLeave(instance, definition);
    }

    throw new Error(`Unsupported strategy ${definition.strategy}`);
  }

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions> {
    const results = definitions.map(def => this.use(def));

    if (results.some(isPromise)) {
      return Promise.all(results) as any;
    }

    return results as any;
  }

  object<TRecord extends Record<PropertyKey, Definition<any, any, any>>>(
    object: TRecord,
  ): HasPromiseMember<InstancesObject<TRecord>[keyof InstancesObject<TRecord>]> extends true
    ? Promise<AwaitedInstanceRecord<TRecord>>
    : InstancesRecord<TRecord> {
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
      return Promise.all(promises).then(() => results) as any;
    } else {
      return results as any;
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

    const cnt = new Container(this.id, bindingsRegistry, instancesStore, this.interceptorsRegistry, null, tags);
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

    const cnt = new Container(
      this.id,
      bindingsRegistry,
      instancesStore,
      scopeInterceptorsRegistry,
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
        return cnt as any;
      }
    }

    return cnt as any;
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
  null,
  [],
);

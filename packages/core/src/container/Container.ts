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
  IStrategyAware,
  UseFn,
} from './IContainer.js';

import { v4 } from 'uuid';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
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

export interface Container extends UseFn<LifeTime> {}

export class Container
  extends ExtensibleFunction
  implements InstancesBuilder, InstanceCreationAware, IContainerScopes, IStrategyAware, IDisposableScopeAware
{
  public readonly id = v4();

  constructor(
    public readonly parentId: string | null,
    protected readonly bindingsRegistry: BindingsRegistry,
    protected readonly instancesStore: InstancesStore,
  ) {
    super(
      <TInstance, TLifeTime extends LifeTime, TArgs extends any[]>(
        definition: Definition<TInstance, TLifeTime, TArgs>,
        ...args: TArgs
      ) => {
        return this.use(definition, ...args);
      },
    );

    this.use = this.use.bind(this);
    this.all = this.all.bind(this);
    this.defer = this.defer.bind(this);
    this.scope = this.scope.bind(this);
    this.withScope = this.withScope.bind(this);
  }

  new(): IContainer;
  new(configureFn: AsyncContainerConfigureFn): Promise<IContainer>;
  new(configureFn: ContainerConfigureFn): IContainer;
  new(configureFn?: ContainerConfigureFn | AsyncContainerConfigureFn): IContainer | Promise<IContainer> {
    const definitionsRegistry = BindingsRegistry.create();
    const instancesStore = InstancesStore.create();

    const cnt = new Container(null, definitionsRegistry, instancesStore);

    if (configureFn) {
      const binder = new ContainerConfigurationDSL(definitionsRegistry, cnt);
      const configResult = configureFn(binder);

      if (configResult instanceof Promise) {
        return configResult.then(() => {
          return cnt;
        });
      } else {
        return cnt;
      }
    }

    return cnt;
  }

  buildExact<T>(definition: Definition<T, any, any>, ...args: any[]): T {
    return definition.create(this, ...args);
  }

  use<TValue, TArgs extends any[]>(
    definition: Definition<TValue, ValidDependenciesLifeTime<LifeTime>, TArgs>,
    ...args: TArgs
  ): TValue {
    const patchedInstanceDef = this.bindingsRegistry.getDefinition(definition);
    return this.buildWithStrategy(patchedInstanceDef, ...args);
  }

  buildWithStrategy: UseFn<LifeTime> = (definition, ...args) => {
    const id = definition.id;

    switch (definition.strategy) {
      case LifeTime.transient:
        if (this.bindingsRegistry.hasFrozenBinding(id)) {
          return this.instancesStore.upsertIntoFrozenInstances(id, () => {
            return definition.create(this, ...args);
          });
        }

        return definition.create(this, ...args);
      case LifeTime.singleton:
        if (this.bindingsRegistry.hasFrozenBinding(id)) {
          return this.instancesStore.upsertIntoFrozenInstances(id, () => {
            return definition.create(this, ...args);
          });
        }

        return this.instancesStore.upsertIntoGlobalInstances(id, () => {
          return definition.create(this, ...args);
        });
      case LifeTime.scoped:
        if (this.bindingsRegistry.hasFrozenBinding(id)) {
          return this.instancesStore.upsertIntoFrozenInstances(id, () => {
            return definition.create(this, ...args);
          });
        }

        return this.instancesStore.upsertIntoScopeInstances(id, () => {
          return definition.create(this, ...args);
        });
      default:
        throw new Error(`Unsupported strategy ${definition.strategy}`);
    }
  };

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

    const cnt = new Container(this.id, bindingsRegistry, instancesStore);
    const disposeFns: DisposeFn[] = [];
    const disposable = new DisposableScope(cnt, disposeFns);

    if (scopeConfigureFn) {
      const binder = new DisposableScopeConfigurationDSL(this, cnt, bindingsRegistry, disposeFns);
      const result = scopeConfigureFn(binder, this);
      if (isPromise(result)) {
        return result.then(() => disposable);
      } else {
        return disposable;
      }
    }

    return disposable;
  }

  scope(): IContainer;
  scope(scopeConfigureFn: AsyncScopeConfigureFn): Promise<IContainer>;
  scope(scopeConfigureFn: ScopeConfigureFn): IContainer;
  scope(scopeConfigureFn?: ScopeConfigureFn | AsyncScopeConfigureFn): IContainer | Promise<IContainer> {
    const bindingsRegistry = this.bindingsRegistry.checkoutForScope();
    const instancesStore = this.instancesStore.childScope();

    const cnt = new Container(this.id, bindingsRegistry, instancesStore);

    if (scopeConfigureFn) {
      const binder = new ScopeConfigurationDSL(this, cnt, bindingsRegistry);
      const result = scopeConfigureFn(binder, this);
      if (result instanceof Promise) {
        return result.then(() => cnt);
      } else {
        return cnt;
      }
    }

    return cnt;
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

export const once = new Container(null, BindingsRegistry.create(), InstancesStore.create()).use;

export const all = new Container(null, BindingsRegistry.create(), InstancesStore.create()).all;

export const container = new Container(null, BindingsRegistry.create(), InstancesStore.create());

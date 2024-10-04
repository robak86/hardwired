import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import {
  AwaitedInstanceArray,
  ContainerRunFn,
  EnsurePromise,
  HasPromise,
  IContainer,
  IContainerScopes,
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
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { AsyncContainerConfigureFn, ContainerConfigureFn } from '../configuration/ContainerConfiguration.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { AsyncScopeConfigureFn, ScopeConfigureFn } from '../configuration/ScopeConfiguration.js';
import { ScopeConfigurationDSL } from '../configuration/dsl/ScopeConfigurationDSL.js';
import { ContainerConfigurationDSL } from '../configuration/dsl/ContainerConfigurationDSL.js';
import { DisposeFn } from '../configuration/abstract/ContainerConfigurable.js';

export interface Container extends UseFn<LifeTime> {}

export class Container
  extends ExtensibleFunction
  implements InstancesBuilder, InstanceCreationAware, IContainerScopes, IStrategyAware, Disposable
{
  public readonly id = v4();
  protected disposeFns: DisposeFn[] = [];
  protected _disposed = false;

  constructor(
    public readonly parentId: string | null,
    protected readonly bindingsRegistry: BindingsRegistry,
    protected readonly instancesStore: InstancesStore,
    protected readonly strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
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
    this.checkoutScope = this.checkoutScope.bind(this);
    this.withScope = this.withScope.bind(this);
  }

  [Symbol.dispose](): void {
    if (this._disposed) {
      throw new Error('Container already disposed');
    }
    this.disposeFns.forEach(disposeFn => disposeFn(this));
    this.disposeFns.length = 0;
    this._disposed = true;
  }

  new(): IContainer;
  new(configureFn: AsyncContainerConfigureFn): Promise<IContainer>;
  new(configureFn: ContainerConfigureFn): IContainer;
  new(configureFn?: ContainerConfigureFn | AsyncContainerConfigureFn): IContainer | Promise<IContainer> {
    const definitionsRegistry = BindingsRegistry.create();
    const instancesStore = InstancesStore.create();

    const cnt = new Container(null, definitionsRegistry, instancesStore);

    if (configureFn) {
      const binder = new ContainerConfigurationDSL(definitionsRegistry, cnt, cnt.disposeFns);
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
    const strategy = this.strategiesRegistry.get(definition.strategy);
    return strategy.buildFn(definition, this.instancesStore, this.bindingsRegistry, this, ...args);
  };

  all<TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions> {
    const results = definitions.map(def => this.use(def));

    if (results.some(result => result instanceof Promise)) {
      return Promise.all(results) as any;
    }

    return results as any;
  }

  defer<TInstance, TArgs extends any[]>(factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>) {
    return (...args: TArgs): TInstance => {
      return this.use(factoryDefinition, ...args);
    };
  }

  checkoutScope(): IContainer;
  checkoutScope(scopeConfigureFn: AsyncScopeConfigureFn): Promise<IContainer>;
  checkoutScope(scopeConfigureFn: ScopeConfigureFn): IContainer;
  checkoutScope(scopeConfigureFn?: ScopeConfigureFn | AsyncScopeConfigureFn): IContainer | Promise<IContainer> {
    const bindingsRegistry = this.bindingsRegistry.checkoutForScope();
    const instancesStore = this.instancesStore.childScope();

    const cnt = new Container(this.id, bindingsRegistry, instancesStore);

    if (scopeConfigureFn) {
      const binder = new ScopeConfigurationDSL(this, cnt, bindingsRegistry, cnt.disposeFns);
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
      const scope: IContainer | Promise<IContainer> = this.checkoutScope(
        configureOrRunFn as ScopeConfigureFn | AsyncScopeConfigureFn,
      );

      if (scope instanceof Promise) {
        return scope.then(scope => {
          const result = runFn(scope);

          scope[Symbol.dispose]();
          return result;
        }) as EnsurePromise<TValue>;
      } else {
        const result = runFn(scope);
        scope[Symbol.dispose]();
        return result;
      }
    } else {
      const scope = this.checkoutScope();
      const result = (configureOrRunFn as ContainerRunFn<any, any>)(scope);

      scope[Symbol.dispose]();
      return result;
    }
  }
}

export const once = new Container(null, BindingsRegistry.create(), InstancesStore.create(), defaultStrategiesRegistry)
  .use;

export const all = new Container(null, BindingsRegistry.create(), InstancesStore.create(), defaultStrategiesRegistry)
  .all;

export const container = new Container(
  null,
  BindingsRegistry.create(),
  InstancesStore.create(),
  defaultStrategiesRegistry,
);

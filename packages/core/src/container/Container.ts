import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import {
  AwaitedInstanceArray,
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
import { containerConfiguratorToOptions, InitFn } from '../configuration/abstract/ContainerConfigurable.js';
import { scopeConfiguratorToOptions } from '../configuration/abstract/ScopeConfigurable.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { ContainerConfiguration, ContainerConfigureCallback } from '../configuration/ContainerConfiguration.js';
import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';

export interface Container extends UseFn<LifeTime> {}

export class Container
  extends ExtensibleFunction
  implements InstancesBuilder, InstanceCreationAware, IContainerScopes, IStrategyAware
{
  public readonly id = v4();

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
  }

  new(optionsOrFunction?: ContainerConfigureCallback | ContainerConfiguration): IContainer {
    const options = containerConfiguratorToOptions(optionsOrFunction);

    const definitionsRegistry = BindingsRegistry.create();
    const instancesStore = InstancesStore.create();

    const cnt = new Container(null, definitionsRegistry, instancesStore);

    const cascading = options.cascadingDefinitions.map(def => def.bind(cnt));
    definitionsRegistry.addCascadingBindings(cascading);
    definitionsRegistry.addScopeBindings(options.scopeDefinitions);
    definitionsRegistry.addFrozenBindings(options.frozenDefinitions);

    options.initializers.forEach(init => init(cnt.use));
    return cnt;
  }

  buildExact<T>(definition: Definition<T, any, any>, ...args: any[]): T {
    return definition.create(this, ...args);
  }

  use: UseFn<LifeTime> = (definition, ...args) => {
    const patchedInstanceDef = this.bindingsRegistry.getDefinition(definition);
    return this.buildWithStrategy(patchedInstanceDef, ...args);
  };

  buildWithStrategy: UseFn<LifeTime> = (definition, ...args) => {
    const strategy = this.strategiesRegistry.get(definition.strategy);
    return strategy.buildFn(definition, this.instancesStore, this.bindingsRegistry, this, ...args);
  };

  all = <TDefinitions extends Array<Definition<any, ValidDependenciesLifeTime<LifeTime>, []>>>(
    ...definitions: [...TDefinitions]
  ): HasPromise<InstancesArray<TDefinitions>> extends true
    ? Promise<AwaitedInstanceArray<TDefinitions>>
    : InstancesArray<TDefinitions> => {
    const results = definitions.map(def => this.use(def));

    if (results.some(result => result instanceof Promise)) {
      return Promise.all(results) as any;
    }

    return results as any;
  };

  defer =
    <TInstance, TArgs extends any[]>(
      factoryDefinition: Definition<TInstance, LifeTime.transient, TArgs>,
    ): ((...args: TArgs) => TInstance) =>
    (...args: TArgs) =>
      this.use(factoryDefinition, ...args);

  checkoutScope: IContainerScopes['checkoutScope'] = (optionsOrConfiguration): IContainer => {
    const options = scopeConfiguratorToOptions(optionsOrConfiguration, this);

    if (options.frozenDefinitions.length > 0) {
      throw new Error('Cannot freeze definitions in a child scope');
    }

    const bindingsRegistry = this.bindingsRegistry.checkoutForScope();
    const instancesStore = this.instancesStore.childScope();

    const cnt = new Container(this.id, bindingsRegistry, instancesStore);

    const cascading = options.cascadingDefinitions.map(def => def.bind(cnt));
    bindingsRegistry.addScopeBindings(options.scopeDefinitions);
    bindingsRegistry.addCascadingBindings(cascading);

    options.initializers.forEach(init => init(cnt.use));

    return cnt;
  };

  withScope: IContainerScopes['withScope'] = (fnOrOptions, fn?: any) => {
    if (typeof fnOrOptions === 'function') {
      return fnOrOptions(this.checkoutScope());
    } else {
      return fn!(this.checkoutScope(fnOrOptions));
    }
  };
}

export type ScopeOptions = {
  readonly frozenDefinitions: readonly Definition<any, LifeTime, any>[];
  readonly scopeDefinitions: readonly Definition<any, LifeTime.transient | LifeTime.scoped, any>[];
  readonly cascadingDefinitions: readonly Definition<any, LifeTime.scoped, []>[];
  readonly initializers: readonly InitFn[];
};

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

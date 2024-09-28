import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { AsyncAllInstances, IContainer, IContainerScopes, InstanceCreationAware, UseFn } from './IContainer.js';

import { v4 } from 'uuid';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { containerConfiguratorToOptions, InitFn } from '../definitions/ContainerConfigureAware.js';
import { scopeConfiguratorToOptions } from '../definitions/ScopeConfigureAware.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { ContainerConfiguration, ContainerConfigureCallback } from './ContainerConfiguration.js';

interface Container extends UseFn<LifeTime> {}

class Container
  extends ExtensibleFunction
  implements InstancesBuilder, InstanceCreationAware, IContainerScopes, IContainer
{
  public readonly id = v4();

  constructor(
    public readonly parentId: string | null,
    private readonly bindingsRegistry: BindingsRegistry,
    private readonly instancesStore: InstancesStore,
    private readonly strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
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

    const definitionsRegistry = BindingsRegistry.create(options);

    const cnt = new Container(null, definitionsRegistry, InstancesStore.create(), defaultStrategiesRegistry);

    options.initializers.forEach(init => init(cnt.use));

    return cnt;
  }

  buildExact<T>(definition: Definition<T, any, any>, ...args: any[]): T {
    return definition.create(this, ...args);
  }

  use: UseFn<LifeTime> = (definition, ...args) => {
    const patchedInstanceDef = this.bindingsRegistry.getDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.buildFn(patchedInstanceDef, this.instancesStore, this.bindingsRegistry, this, ...args);
  };

  all = <TDefinitions extends Array<Definition<any, any, []>>>(
    ...definitions: [...TDefinitions]
  ): TDefinitions extends Array<Definition<Promise<any>, any, []>>
    ? Promise<AsyncAllInstances<TDefinitions>>
    : InstancesArray<TDefinitions> => {
    const results = definitions.map(def => this.use(def));

    if (results.some(result => result instanceof Promise)) {
      return Promise.all(results) as any;
    }

    return results as any;
  };

  checkoutScope: IContainerScopes['checkoutScope'] = (optionsOrConfiguration): IContainer => {
    const options = scopeConfiguratorToOptions(optionsOrConfiguration, this);

    const cnt = new Container(
      this.id,
      this.bindingsRegistry.checkoutForScope(options.scopeDefinitions, options.frozenDefinitions),
      this.instancesStore.childScope(),
      this.strategiesRegistry,
    );

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
  readonly frozenDefinitions: readonly Definition<any, any, any>[];
  readonly scopeDefinitions: readonly Definition<any, any, any>[];
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

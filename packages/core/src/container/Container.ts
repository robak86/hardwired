import { InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';

import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { AsyncAllInstances, IContainer, IContainerScopes, InstanceCreationAware, UseFn } from './IContainer.js';

import { ContextEvents } from '../events/ContextEvents.js';

import { ExtensibleFunction } from '../utils/ExtensibleFunction.js';
import { Overrides } from './Overrides.js';
import { Definition } from '../definitions/abstract/Definition.js';
import { InstancesBuilder } from '../context/abstract/InstancesBuilder.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { BindingsRegistry } from '../context/BindingsRegistry.js';
import { InstancesStore } from '../context/InstancesStore.js';
import { v4 } from 'uuid';
import { LifeTime } from '../definitions/abstract/LifeTime.js';
import { ContainerConfiguration, ContainerConfigureCallback } from './ContainerConfiguration.js';
import { containerConfiguratorToOptions } from '../definitions/ContainerConfigureAware.js';
import { scopeConfiguratorToOptions } from '../definitions/ScopeConfigureAware.js';

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
    public readonly events: ContextEvents,
  ) {
    super((definition: Definition<any, any, any>, ...args: any[]) => {
      return this.use(definition as any, ...args); // TODO: fix type
    });
  }

  new(optionsOrFunction?: ScopeOptions | ContainerConfigureCallback | ContainerConfiguration): IContainer {
    const options = containerConfiguratorToOptions(optionsOrFunction);

    const definitionsRegistry = BindingsRegistry.create(options);

    return new Container(
      null,
      definitionsRegistry,
      InstancesStore.create(options.scopeDefinitions ?? []),
      defaultStrategiesRegistry,
      new ContextEvents(),
    );
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
    // return definitions.map(def => this.use(def)) as InstancesArray<TDefinitions>;

    const results = definitions.map(def => this.use(def));

    // Check if the first element is a promise to decide whether to wrap in Promise.all
    if (results.some(result => result instanceof Promise)) {
      return Promise.all(results) as any;
    }

    return results as any;
  };

  checkoutScope: IContainerScopes['checkoutScope'] = (optionsOrConfiguration): IContainer => {
    const options = scopeConfiguratorToOptions(optionsOrConfiguration, this);

    const scopeContext = new Container(
      this.id,
      this.bindingsRegistry.checkoutForScope(options.scopeDefinitions ?? [], options.frozenDefinitions ?? []),
      this.instancesStore.childScope(options.scopeDefinitions ?? []),
      this.strategiesRegistry,
      this.events,
    );

    this.events.onScope.emit({ initiatorContainerId: this.id, scopeContainerId: scopeContext.id });

    return scopeContext;
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
  frozenDefinitions?: Overrides; // propagated to descendant containers
  scopeDefinitions?: Overrides;
};

export const once = new Container(
  null,
  BindingsRegistry.empty(),
  InstancesStore.create([]),
  defaultStrategiesRegistry,
  new ContextEvents(),
).use;

export const container = new Container(
  null,
  BindingsRegistry.empty(),
  InstancesStore.create([]),
  defaultStrategiesRegistry,
  new ContextEvents(),
);

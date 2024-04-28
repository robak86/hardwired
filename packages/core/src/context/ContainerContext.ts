import { InstancesStore } from './InstancesStore.js';
import { ContainerScopeOptions } from '../container/Container.js';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';

import { InstancesBuilder } from './abstract/InstancesBuilder.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { InstanceDefinition, InstancesArray } from '../definitions/abstract/sync/InstanceDefinition.js';
import { v4 } from 'uuid';
import { IContainerScopes, InstanceCreationAware, IServiceLocator } from '../container/IContainer.js';
import { Omit } from 'utility-types';

import { ValidDependenciesLifeTime } from '../definitions/abstract/sync/InstanceDefinitionDependency.js';
import { LifeTime } from '../definitions/abstract/LifeTime.js';

export class ContainerContext implements InstancesBuilder, InstanceCreationAware, IContainerScopes {
  static empty(strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(null, instancesEntries, InstancesStore.create([]), strategiesRegistry);
  }

  static create(
    scopeOverrides: InstanceDefinition<any, any, any>[],
    globalOverrides: InstanceDefinition<any, any, any>[],
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ): ContainerContext {
    const definitionsRegistry = InstancesDefinitionsRegistry.create(scopeOverrides, globalOverrides);

    return new ContainerContext(null, definitionsRegistry, InstancesStore.create(scopeOverrides), strategiesRegistry);
  }

  public readonly id = v4();

  constructor(
    public readonly parentId: string | null,
    private readonly instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private readonly instancesCache: InstancesStore,
    private readonly strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ) {}

  use = (definition: InstanceDefinition<any, any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.build(patchedInstanceDef, this.instancesCache, this.instancesDefinitionsRegistry, this);
  };

  useAll = <TDefinitions extends InstanceDefinition<any, ValidDependenciesLifeTime<LifeTime>, any>[]>(
    ...definitions: [...TDefinitions]
  ): InstancesArray<TDefinitions> => {
    return definitions.map(definition => this.use(definition)) as InstancesArray<TDefinitions>;
  };

  override(definition: InstanceDefinition<any, any, any>): void {
    if (this.instancesCache.hasInCurrentScope(definition.id)) {
      throw new Error(
        `Cannot override definition. Instance for id=${definition.id} was already created in the current scope.`,
      );
    }

    this.instancesDefinitionsRegistry.addScopeOverride(definition);
  }
  buildExact<T>(definition: InstanceDefinition<T, any, any>): T;
  buildExact<T>(definition: InstanceDefinition<Promise<T>, any, any>): Promise<T>;
  buildExact<T>(definition: InstanceDefinition<Promise<T> | T, any, any>): T | Promise<T> {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    return patchedInstanceDef.create(this);
  }

  provide<T>(def: InstanceDefinition<T, LifeTime.scoped, any>, instance: T) {
    throw new Error('Implement me!');
  }

  checkoutScope = (options: Omit<ContainerScopeOptions, 'globalOverrides'> = {}): ContainerContext => {
    const { overrides = [] } = options;

    return new ContainerContext(
      this.id,
      this.instancesDefinitionsRegistry.checkoutForScope(overrides),
      this.instancesCache.childScope(overrides),
      this.strategiesRegistry,
    );
  };

  withScope<TValue>(fn: (locator: IServiceLocator<LifeTime>) => TValue): TValue {
    const scopeContext = this.checkoutScope();

    return fn(scopeContext);
  }
}

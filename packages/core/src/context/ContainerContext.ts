import { InstancesStore } from './InstancesStore.js';
import { ContainerScopeOptions } from '../container/Container.js';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry.js';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry.js';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition.js';
import { InstancesBuilder } from './abstract/InstancesBuilder.js';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry.js';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition.js';
import { externalsToScopeOverrides, ExternalsValues } from '../utils/PickExternals.js';

export class ContainerContext implements InstancesBuilder {
  static empty(strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(instancesEntries, InstancesStore.create([]), strategiesRegistry);
  }

  static create(
    scopeOverrides: AnyInstanceDefinition<any, any, never>[],
    globalOverrides: AnyInstanceDefinition<any, any, never>[],
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ): ContainerContext {
    const definitionsRegistry = InstancesDefinitionsRegistry.create(scopeOverrides, globalOverrides);

    return new ContainerContext(definitionsRegistry, InstancesStore.create(scopeOverrides), strategiesRegistry);
  }

  constructor(
    private instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private instancesCache: InstancesStore,
    private strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ) {}

  get<TValue, TExternals>(
    instanceDefinition: InstanceDefinition<TValue, any, TExternals>,
    ...[externals]: ExternalsValues<TExternals>
  ): TValue {
    if (externals) {
      const scopedContainer = this.checkoutScope(
        {
          scopeOverrides: externalsToScopeOverrides(instanceDefinition, externals),
        },
        true,
      );

      return scopedContainer.get(instanceDefinition, ...([] as ExternalsValues<TExternals>));
    } else {
      return this.buildWithStrategy(instanceDefinition);
    }
  }

  getAsync<TValue, TExternals>(
    instanceDefinition: AnyInstanceDefinition<TValue, any, TExternals>,
    ...[externals]: ExternalsValues<TExternals>
  ): Promise<TValue> {
    if (externals) {
      const scopedContainer = this.checkoutScope(
        {
          scopeOverrides: externalsToScopeOverrides(instanceDefinition, externals),
        },
        true,
      );

      return scopedContainer.getAsync(instanceDefinition, ...([] as ExternalsValues<TExternals>));
    } else {
      return this.buildWithStrategy(instanceDefinition);
    }
  }

  buildExact = (definition: AnyInstanceDefinition<any, any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    return patchedInstanceDef.create(this);
  };

  buildWithStrategy = (definition: AnyInstanceDefinition<any, any, any>) => {
    const patchedInstanceDef = this.instancesDefinitionsRegistry.getInstanceDefinition(definition);
    const strategy = this.strategiesRegistry.get(definition.strategy);

    return strategy.build(patchedInstanceDef, this.instancesCache, this.instancesDefinitionsRegistry, this);
  };

  checkoutRequestScope(): ContainerContext {
    return new ContainerContext(
      this.instancesDefinitionsRegistry.checkoutForRequestScope(),
      this.instancesCache.checkoutForRequestScope(),
      this.strategiesRegistry,
    );
  }

  checkoutScope(
    options: Omit<ContainerScopeOptions, 'globalOverrides'> = {},
    inheritRequestScope = false,
  ): ContainerContext {
    const { scopeOverrides = [] } = options;

    return new ContainerContext(
      this.instancesDefinitionsRegistry.checkoutForScope(scopeOverrides),
      this.instancesCache.childScope(scopeOverrides, inheritRequestScope),
      this.strategiesRegistry,
    );
  }
}

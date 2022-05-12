import { InstancesStore } from './InstancesStore';
import { ContainerScopeOptions, ExternalsValues } from '../container/Container';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry';
import { AnyInstanceDefinition } from '../definitions/abstract/AnyInstanceDefinition';
import { InstancesBuilder } from './abstract/InstancesBuilder';
import { defaultStrategiesRegistry } from '../strategies/collection/defaultStrategiesRegistry';
import { InstanceDefinition } from '../definitions/abstract/sync/InstanceDefinition';

export class ContainerContext implements InstancesBuilder {
  static empty(strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(instancesEntries, InstancesStore.create([]), strategiesRegistry);
  }

  static create(
    scopeOverrides: AnyInstanceDefinition<any, any, any>[],
    globalOverrides: AnyInstanceDefinition<any, any, any>[],
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
    ...externals: ExternalsValues<TExternals>
  ): TValue {
    if (instanceDefinition.scopeOverrides && useOverrides) {
      const scopedContainer = this.checkoutScope(
        {
          scopeOverrides: instanceDefinition.scopeOverrides,
        },
        true,
      );

      return scopedContainer.get(instanceDefinition, false);
    } else {
      return this.buildWithStrategy(instanceDefinition);
    }
  }

  getAsync<TValue, TExternals>(
    instanceDefinition: AnyInstanceDefinition<TValue, any, TExternals>,
    ...externals: ExternalsValues<TExternals>
  ): Promise<TValue> {
    if (instanceDefinition.scopeOverrides && useOverrides) {
      const scopedContainer = this.checkoutScope(
        {
          scopeOverrides: instanceDefinition.scopeOverrides,
        },
        true,
      );

      return scopedContainer.getAsync(instanceDefinition, false);
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

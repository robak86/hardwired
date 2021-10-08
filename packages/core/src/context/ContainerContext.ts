import { InstancesCache } from './InstancesCache';
import { ContainerScopeOptions, defaultStrategiesRegistry } from '../container/Container';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry';
import { instanceDefinition, InstanceDefinition } from '../definitions/InstanceDefinition';
import { StrategiesRegistry } from '../strategies/collection/StrategiesRegistry';
import { AnyInstanceDefinition } from '../definitions/AnyInstanceDefinition';
import { AsyncInstancesCache } from './AsyncInstancesCache';
import { InstancesBuilder } from './InstancesBuilder';

export class ContainerContext {
  static empty(strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(
      instancesEntries,
      InstancesCache.create([]),
      AsyncInstancesCache.create([]),
      strategiesRegistry,
    );
  }

  static create(
    scopeOverrides: AnyInstanceDefinition<any, any>[],
    globalOverrides: AnyInstanceDefinition<any, any>[],
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ): ContainerContext {
    const definitionsRegistry = InstancesDefinitionsRegistry.create(scopeOverrides, globalOverrides);

    const syncOverrides = scopeOverrides.filter(instanceDefinition.isSync);
    const asyncOverrides = scopeOverrides.filter(instanceDefinition.isAsync);

    return new ContainerContext(
      definitionsRegistry,
      InstancesCache.create(syncOverrides),
      AsyncInstancesCache.create(asyncOverrides),
      strategiesRegistry,
    );
  }

  private instancesBuilder;

  constructor(
    private instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private instancesCache: InstancesCache,
    private asyncInstancesCache: AsyncInstancesCache,
    private strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ) {
    this.instancesBuilder = new InstancesBuilder(
      this.instancesCache,
      this.asyncInstancesCache,
      this.instancesDefinitionsRegistry,
      this.strategiesRegistry,
    );
  }

  get<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any>): TValue {
    return this.instancesBuilder.buildWithStrategy(instanceDefinition);
  }

  getAsync<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any>): Promise<TValue> {
    return this.instancesBuilder.buildWithStrategy(instanceDefinition);
  }

  checkoutRequestScope(): ContainerContext {
    return new ContainerContext(
      this.instancesDefinitionsRegistry.checkoutForRequestScope(),
      this.instancesCache.checkoutForRequestScope(),
      this.asyncInstancesCache.checkoutForRequestScope(),

      this.strategiesRegistry,
    );
  }

  childScope(options: Omit<ContainerScopeOptions, 'globalOverrides'>): ContainerContext {
    const { scopeOverrides = [] } = options;
    const syncOverrides = scopeOverrides.filter(instanceDefinition.isSync);
    const asyncOverrides = scopeOverrides.filter(instanceDefinition.isAsync);

    return new ContainerContext(
      this.instancesDefinitionsRegistry.checkoutForScope(scopeOverrides),
      this.instancesCache.childScope(syncOverrides),
      this.asyncInstancesCache.childScope(asyncOverrides),
      this.strategiesRegistry,
    );
  }
}

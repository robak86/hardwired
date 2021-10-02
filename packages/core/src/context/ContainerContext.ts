import { InstancesCache } from './InstancesCache';
import { ModuleMaterialization } from './ModuleMaterialization';
import { ContainerScopeOptions, defaultStrategiesRegistry } from '../container/Container';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry';
import { InstanceDefinition } from '../new/InstanceDefinition';
import { StrategiesRegistry } from "../strategies/collection/StrategiesRegistry";

export class ContainerContext {
  static empty(strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry) {
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(
      instancesEntries,
      InstancesCache.create([]),
      new ModuleMaterialization(instancesEntries),
      strategiesRegistry,
    );
  }

  static create(
    scopeOverridesNew: InstanceDefinition<any>[],
    globalOverridesNew: InstanceDefinition<any>[],
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ): ContainerContext {
    const definitionsRegistry = InstancesDefinitionsRegistry.create(scopeOverridesNew, globalOverridesNew);

    return new ContainerContext(
      definitionsRegistry,
      InstancesCache.create(scopeOverridesNew),
      new ModuleMaterialization(definitionsRegistry),
      strategiesRegistry,
    );
  }

  constructor(
    private instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private instancesCache: InstancesCache,
    private materialization: ModuleMaterialization,
    private strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ) {}

  get<TValue>(instanceDefinition: InstanceDefinition<TValue>): TValue {
    const instanceOrOverride = this.instancesDefinitionsRegistry.getInstanceDefinition(instanceDefinition);
    const strategy = this.strategiesRegistry.get(instanceOrOverride.strategy);
    return strategy.build(
      instanceOrOverride,
      this.instancesCache,
      this.instancesDefinitionsRegistry,
      this.strategiesRegistry,
    );
    // return this.materialization.runInstanceDefinition(moduleInstance, resolver, this.instancesCache);
  }

  materialize<TModule extends Record<string, InstanceDefinition<any>>>(
    module: TModule,
  ): { [K in keyof TModule]: TModule[K] extends InstanceDefinition<infer TValue> ? TValue : unknown } {
    const materialized = {};

    // TODO: we still should use lazy materialization
    Object.keys(module).forEach(key => {
      const instanceDefinition = module[key];
      materialized[key] = this.get(instanceDefinition);
    });

    return materialized as any;
  }

  checkoutRequestScope(): ContainerContext {
    return new ContainerContext(
      this.instancesDefinitionsRegistry.checkoutForRequestScope(),
      this.instancesCache.checkoutForRequestScope(),
      new ModuleMaterialization(this.instancesDefinitionsRegistry),
      this.strategiesRegistry,
    );
  }

  childScope(options: Omit<ContainerScopeOptions, 'globalOverrides'>): ContainerContext {
    const { scopeOverridesNew = [] } = options;

    return new ContainerContext(
      this.instancesDefinitionsRegistry.checkoutForScope(scopeOverridesNew),
      this.instancesCache.childScope(scopeOverridesNew),
      new ModuleMaterialization(this.instancesDefinitionsRegistry),
      this.strategiesRegistry,
    );
  }
}

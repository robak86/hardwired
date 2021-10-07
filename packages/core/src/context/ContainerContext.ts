import { InstancesCache } from './InstancesCache';
import { ModuleMaterialization } from './ModuleMaterialization';
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
      new ModuleMaterialization(instancesEntries),
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
      new ModuleMaterialization(definitionsRegistry),
      strategiesRegistry,
    );
  }

  constructor(
    private instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private instancesCache: InstancesCache,
    private asyncInstancesCache: AsyncInstancesCache,
    private materialization: ModuleMaterialization,
    private strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ) {}

  get<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any>): TValue {
    const instancesBuilder = new InstancesBuilder(
      this.instancesCache,
      this.asyncInstancesCache,
      this.instancesDefinitionsRegistry,
      this.strategiesRegistry,
    );

    return instancesBuilder.buildWithStrategy(instanceDefinition);
  }

  getAsync<TValue>(instanceDefinition: AnyInstanceDefinition<TValue, any>): Promise<TValue> {
    const instanceOrOverride = this.instancesDefinitionsRegistry.getInstanceDefinition(instanceDefinition);
    // const strategy = this.strategiesRegistry.getAsync(instanceOrOverride.strategy);
    const instancesBuilder = new InstancesBuilder(
      this.instancesCache,
      this.asyncInstancesCache,
      this.instancesDefinitionsRegistry,
      this.strategiesRegistry,
    );

    return instancesBuilder.buildWithStrategy(instanceDefinition);


    // return strategy.build(
    //   instanceOrOverride,
    //   this.instancesCache,
    //   this.asyncInstancesCache,
    //   this.instancesDefinitionsRegistry,
    //   instancesBuilder,
    // );
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
      this.asyncInstancesCache.checkoutForRequestScope(),
      new ModuleMaterialization(this.instancesDefinitionsRegistry),
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
      new ModuleMaterialization(this.instancesDefinitionsRegistry),
      this.strategiesRegistry,
    );
  }
}

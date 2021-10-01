import { ResolversRegistry } from './ResolversRegistry';
import { InstancesCache } from './InstancesCache';
import { ModuleMaterialization } from './ModuleMaterialization';
import { Module } from '../module/Module';
import { createContainerId } from '../utils/fastId';
import { ContainerScopeOptions, defaultStrategiesRegistry } from '../container/Container';
import { ModulePatch } from '../module/ModulePatch';
import { InstancesDefinitionsRegistry } from './InstancesDefinitionsRegistry';
import { InstanceEntry } from '../new/InstanceEntry';
import { StrategiesRegistry } from '../strategies/abstract/_BuildStrategy';

export class ContainerContext {
  static empty(strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry) {
    const resolversRegistry = ResolversRegistry.empty();
    const instancesEntries = InstancesDefinitionsRegistry.empty();

    return new ContainerContext(
      createContainerId(),
      resolversRegistry,
      instancesEntries,
      InstancesCache.create([]),
      new ModuleMaterialization(resolversRegistry),
      strategiesRegistry,
    );
  }

  static create(
    scopeOverrides: ModulePatch<any>[],
    globalOverrides: ModulePatch<any>[],
    scopeOverridesNew: InstanceEntry<any>[],
    globalOverridesNew: InstanceEntry<any>[],
    strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ): ContainerContext {
    const resolversRegistry = ResolversRegistry.create(scopeOverrides, globalOverrides);
    const instancesEntries = InstancesDefinitionsRegistry.create(scopeOverridesNew, globalOverridesNew);

    return new ContainerContext(
      createContainerId(),
      resolversRegistry,
      instancesEntries,
      InstancesCache.create(scopeOverrides),
      new ModuleMaterialization(resolversRegistry),
      strategiesRegistry,
    );
  }

  constructor(
    public id: string,
    private resolversRegistry: ResolversRegistry,
    private instancesDefinitionsRegistry: InstancesDefinitionsRegistry,
    private instancesCache: InstancesCache,
    private materialization: ModuleMaterialization,
    private strategiesRegistry: StrategiesRegistry = defaultStrategiesRegistry,
  ) {}

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    const resolver = this.resolversRegistry.getModuleInstanceResolver(moduleInstance, name);
    return this.materialization.runInstanceDefinition(moduleInstance, resolver, this.instancesCache);
  }

  __get<TValue>(instanceDefinition: InstanceEntry<TValue>): TValue {
    const instanceOrOverride = this.instancesDefinitionsRegistry.getInstanceEntry(instanceDefinition);
    const strategy = this.strategiesRegistry.get(instanceOrOverride.strategy);
    return strategy.build(instanceOrOverride, this.instancesCache, this.instancesDefinitionsRegistry, this.strategiesRegistry);
    // return this.materialization.runInstanceDefinition(moduleInstance, resolver, this.instancesCache);
  }

  materialize<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    return this.materialization.materialize(module, this.instancesCache);
  }

  __materialize<TModule extends Record<string, InstanceEntry<any>>>(
    module: TModule,
  ): { [K in keyof TModule]: TModule[K] extends InstanceEntry<infer TValue> ? TValue : unknown } {

    const materialized = {};


    // TODO: we still should use lazy materialization
    Object.keys(module).forEach(key => {
      const instanceEntry = module[key];
      const instance = this.__get(instanceEntry)
      materialized[key] = instance;
    })

    return materialized as any
  }

  checkoutRequestScope(): ContainerContext {
    return new ContainerContext(
      createContainerId(),
      this.resolversRegistry.checkoutForRequestScope(),
      this.instancesDefinitionsRegistry.checkoutForRequestScope(),
      this.instancesCache.checkoutForRequestScope(),
      new ModuleMaterialization(this.resolversRegistry),
      this.strategiesRegistry,
    );
  }

  childScope(options: Omit<ContainerScopeOptions, 'globalOverrides'>): ContainerContext {
    const { scopeOverrides = [], scopeOverridesNew = [] } = options;

    return new ContainerContext(
      createContainerId(),
      this.resolversRegistry.checkoutForScope(scopeOverrides),
      this.instancesDefinitionsRegistry.checkoutForScope(scopeOverridesNew),
      this.instancesCache.childScope(scopeOverrides),
      new ModuleMaterialization(this.resolversRegistry),
      this.strategiesRegistry,
    );
  }
}

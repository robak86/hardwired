import { ResolversRegistry } from './ResolversRegistry';
import { InstancesCache } from './InstancesCache';
import { ModuleMaterialization } from './ModuleMaterialization';
import { Module } from '../module/Module';
import { createContainerId } from '../utils/fastId';
import { ContainerScopeOptions } from '../container/Container';
import { ModulePatch } from '../module/ModulePatch';

export class ContainerContext {
  static empty() {
    const resolversRegistry = ResolversRegistry.empty();

    return new ContainerContext(
      createContainerId(),
      resolversRegistry,
      InstancesCache.create([]),
      new ModuleMaterialization(resolversRegistry),
    );
  }

  static create(scopeOverrides: ModulePatch<any>[], globalOverrides: ModulePatch<any>[]): ContainerContext {
    const resolversRegistry = ResolversRegistry.create(scopeOverrides, globalOverrides);

    return new ContainerContext(
      createContainerId(),
      resolversRegistry,
      InstancesCache.create(scopeOverrides),
      new ModuleMaterialization(resolversRegistry),
    );
  }

  constructor(
    public id: string,
    private resolversRegistry: ResolversRegistry,
    private instancesCache: InstancesCache,
    private materialization: ModuleMaterialization,
  ) {}

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    const resolver = this.resolversRegistry.getModuleInstanceResolver(moduleInstance, name);
    return this.materialization.runInstanceDefinition(moduleInstance, resolver, this.instancesCache);
  }

  materialize<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    return this.materialization.materialize(module, this.instancesCache);
  }

  checkoutRequestScope(): ContainerContext {
    return new ContainerContext(
      createContainerId(),
      this.resolversRegistry.checkoutForRequestScope(),
      this.instancesCache.checkoutForRequestScope(),
      new ModuleMaterialization(this.resolversRegistry),
    );
  }

  childScope(options: Omit<ContainerScopeOptions, 'globalOverrides'>): ContainerContext {
    const { scopeOverrides = [] } = options;

    return new ContainerContext(
      createContainerId(),
      this.resolversRegistry.checkoutForScope(scopeOverrides),
      this.instancesCache.childScope(scopeOverrides),
      new ModuleMaterialization(this.resolversRegistry),
    );
  }
}

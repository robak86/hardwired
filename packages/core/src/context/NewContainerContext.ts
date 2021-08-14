import { ResolversRegistry } from './ResolversRegistry';
import { InstancesCache } from './InstancesCache';
import { ModuleMaterialization } from './ModuleMaterialization';
import { Module } from '../module/Module';
import { ContainerContext } from './ContainerContext';


export class NewContainerContext {
  constructor(
    private resolversRegistry: ResolversRegistry,
    private instancesCache: InstancesCache,
    private materialization: ModuleMaterialization,
  ) {}

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
    context: ContainerContext,
  ): Module.Materialized<TLazyModule>[K] {
    const resolver = this.resolversRegistry.getModuleInstanceResolver(moduleInstance, name);
    return this.materialization.runInstanceDefinition(resolver, context);
  }


}

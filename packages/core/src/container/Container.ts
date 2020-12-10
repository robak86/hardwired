import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';
import { ModuleBuilder } from '../module/ModuleBuilder';
import { InstanceEvents } from './InstanceEvents';
import { MaterializedRecord, Module } from '../resolvers/abstract/Module';

export class Container<TModule extends ModuleBuilder<any>> {
  constructor(private containerContext: ContainerContext = ContainerContext.empty()) {}

  getContext(): ContainerContext {
    return this.containerContext;
  }

  get<TLazyModule extends ModuleBuilder<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    if (!this.hasModule(moduleInstance)) {
      this.load(moduleInstance);
    }

    const module = this.containerContext.getModule(moduleInstance.moduleId);
    invariant(
      module,
      `Cannot find module for module name ${moduleInstance.moduleId.name} and id ${moduleInstance.moduleId.id} while getting definition named: ${name}`,
    );

    return module.get(name, this.containerContext) as any;
  }

  hasModule(module: Module<any>): boolean {
    return this.containerContext.hasModule(module.moduleId);
  }

  load(module: Module<any>) {
    invariant(!this.hasModule(module), `Module ${module.moduleId} is already loaded`);
    this.containerContext.loadModule(module);
  }

  getEvents<TRegistryRecord extends Module.EntriesRecord, K extends keyof MaterializedRecord<TRegistryRecord> & string>(
    module: Module<TRegistryRecord>,
    key: K,
  ): InstanceEvents {
    if (!this.containerContext.hasModule(module.moduleId)) {
      this.containerContext.loadModule(module);
    }

    const resolver = module.getResolver(key);

    if (resolver.kind === 'moduleResolver') {
      throw new Error('Cannot get events for module resolver');
    }

    return this.containerContext.getInstancesEvents(resolver.id);
  }
}

export function container(): Container<ModuleBuilder<{}>> {
  const container = new Container(ContainerContext.empty());
  return container as any;
}

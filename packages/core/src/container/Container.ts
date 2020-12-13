import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';
import { ModuleBuilder } from '../module/ModuleBuilder';
import { InstanceEvents } from './InstanceEvents';
import { MaterializedRecord, Module } from '../resolvers/abstract/Module';
import { AcquiredInstance, Instance } from '../resolvers/abstract/Instance';

export class Container<TModule extends ModuleBuilder<any>> {
  constructor(private containerContext: ContainerContext = ContainerContext.empty()) {}

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

  // TODO: how does this relate to scopes ? e.g. request ?
  acquireInstanceResolver<TLazyModule extends ModuleBuilder<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): AcquiredInstance<Module.Materialized<TLazyModule>[K]> {
    if (!this.containerContext.hasModule(moduleInstance.moduleId)) {
      this.containerContext.loadModule(moduleInstance);
    }

    return moduleInstance.getResolver(name).acquire(this.containerContext);
  }

  hasModule(module: Module<any>): boolean {
    return this.containerContext.hasModule(module.moduleId);
  }

  // TODO: this could be protected (and lazily evaluated) assuming that modules loading does not have any side effects
  load(module: Module<any>) {
    invariant(!this.hasModule(module), `Module ${module.moduleId} is already loaded`);
    this.containerContext.loadModule(module);
  }


}

export function container(containerContext = ContainerContext.empty()): Container<ModuleBuilder<{}>> {
  const container = new Container(containerContext);
  return container as any;
}

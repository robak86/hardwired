import { ContainerContext } from './ContainerContext';
import invariant from 'tiny-invariant';
import { ModuleBuilder } from '../module/ModuleBuilder';
import { Module } from '../resolvers/abstract/Module';
import { AcquiredInstance, Instance } from '../resolvers/abstract/Instance';
import { ClassType } from '../utils/ClassType';

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

  // TODO: allow using resolvers factory, .e.g singleton, selector, store
  getByType<TValue, TResolverClass extends Instance<TValue, any>>(type: ClassType<TResolverClass, any>): TValue[] {
    return this.containerContext.resolvers.filterByType(type).map(resolver => resolver.build(this.containerContext));
  }

  // TODO: how does this relate to scopes ? e.g. request ?
  acquireInstanceResolver<TLazyModule extends ModuleBuilder<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): AcquiredInstance<Module.Materialized<TLazyModule>[K]> {
    if (!this.containerContext.hasModule(moduleInstance.moduleId)) {
      this.containerContext.loadModule(moduleInstance);
    }

    const moduleToBeUsed = this.containerContext.injections.hasKey(moduleInstance.moduleId.id)
      ? this.containerContext.injections.get(moduleInstance.moduleId.id)
      : moduleInstance;

    return moduleToBeUsed.getResolver(name, this.containerContext, this.containerContext.injections).acquire(this.containerContext);
  }

  hasModule(module: Module<any>): boolean {
    return this.containerContext.hasModule(module.moduleId);
  }

  // TODO: rename override|mock|replace ?
  inject(module: Module<any>) {
    invariant(!this.hasModule(module), `Cannot inject module: ${module.moduleId}. Module is already loaded`);
    this.containerContext.inject(module);
  }

  // TODO: this could be protected (and lazily evaluated) assuming that modules loading does not have any side effects
  // TODO: It was required for
  // TODO: it is still required for testing (providing injections)
  // TODO: rename to inject and extract injections from the module to container (but this is still orthogonal to modules loading) ?
  load(module: Module<any>) {
    invariant(!this.hasModule(module), `Module ${module.moduleId} is already loaded`);
    this.containerContext.loadModule(module);
  }
}

// TODO: should take context... or maybe injections ? This will allow for removing a imperative .inject method
export function container(containerContext = ContainerContext.empty()): Container<ModuleBuilder<{}>> {
  const container = new Container(containerContext);
  return container as any;
}

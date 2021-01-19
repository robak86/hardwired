import { ContainerContext } from './ContainerContext';
import { ModuleBuilder } from '../module/ModuleBuilder';
import { AnyResolver, MaterializedRecord, Module } from '../resolvers/abstract/Module';
import { AcquiredInstance, Instance } from '../resolvers/abstract/Instance';
import { ClassType } from '../utils/ClassType';

export class Container {
  constructor(
    private containerContext: ContainerContext = ContainerContext.empty(),
    overrides: Module<any>[],
    eager: Module<any>[],
  ) {
    overrides.forEach(m => this.containerContext.override(m));
    eager.forEach(m => this.containerContext.eagerLoad(m));
  }

  get<TLazyModule extends ModuleBuilder<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    const resolver = this.containerContext.getInstanceResolver(moduleInstance, name);
    return resolver.build(this.containerContext);
  }

  // TODO: allow using resolvers factory, .e.g singleton, selector, store
  // TODO: it may be very tricky since container leverages lazy loading if possible
  __getByType_experimental<TValue, TResolverClass extends Instance<TValue, any>>(
    type: ClassType<TResolverClass, any>,
  ): TValue[] {
    return this.containerContext.resolvers.filterByType(type).map(resolver => resolver.build(this.containerContext));
  }

  // TODO: how does this relate to scopes ? e.g. request ?
  __acquireInstanceResolver_experimental<
    TLazyModule extends ModuleBuilder<any>,
    K extends Module.InstancesKeys<TLazyModule> & string
  >(moduleInstance: TLazyModule, name: K): AcquiredInstance<Module.Materialized<TLazyModule>[K]> {
    return this.containerContext.getInstanceResolver(moduleInstance, name).acquire(this.containerContext);
  }

  asObject<TRecord extends Record<string, AnyResolver>>(module: Module<TRecord>): MaterializedRecord<TRecord> {
    return this.containerContext.asObject(module);
  }
}

export type ContainerOptions = {
  overrides?: Module<any>[];
  eager?: Module<any>[];
  context?: ContainerContext;
};

export function container({
  context = ContainerContext.empty(),
  overrides = [],
  eager = [],
}: ContainerOptions = {}): Container {
  const container = new Container(context, overrides, eager);
  return container as any;
}

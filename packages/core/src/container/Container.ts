import { ContainerContext } from './ContainerContext';
import { ModuleBuilder } from '../module/ModuleBuilder';
import { Module } from '../resolvers/abstract/Module';
import { Instance } from '../resolvers/abstract/Instance';
import { ClassType } from '../utils/ClassType';

export class Container {
  constructor(
    private containerContext: ContainerContext = ContainerContext.empty(),
    private overrides: Module<any>[],
    private eager: Module<any>[],
  ) {
    overrides.forEach(m => this.containerContext.override(m));
    eager.forEach(m => this.containerContext.eagerLoad(m));
  }

  get<TLazyModule extends ModuleBuilder<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    return this.containerContext.get(moduleInstance, name);
  }

  // TODO: allow using resolvers factory, .e.g singleton, selector, store
  // TODO: it may be very tricky since container leverages lazy loading if possible
  __getByType_experimental<TValue, TResolverClass extends Instance<TValue, any>>(
    type: ClassType<TResolverClass, any>,
  ): TValue[] {
    return this.containerContext.resolvers.filterByType(type).map(resolver => {
      return this.containerContext.runResolver(resolver, this.containerContext);
    });
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    const requestContext = this.containerContext.forNewRequest();
    return this.containerContext.materializeModule(module, requestContext);
  }

  getContext(): ContainerContext {
    return this.containerContext;
  }

  checkout(): Container {
    return new Container(this.containerContext.forNewRequest(), this.overrides, this.eager);
  }
}

export type ContainerOptions = {
  overrides?: Module<any>[];
  eager?: Module<any>[];
  context?: ContainerContext;
};

// TODO: overrides are also eagerly loaded
// TODO: add runtime check for duplicates in eager, and overrides options
export function container({
  context = ContainerContext.empty(),
  overrides = [],
  eager = [],
}: ContainerOptions = {}): Container {
  const container = new Container(context, overrides, eager);
  return container as any;
}

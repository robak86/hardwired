import { ContainerContext } from './ContainerContext';
import { Module } from '../resolvers/abstract/Module';

export class Container {
  constructor(
    private containerContext: ContainerContext = ContainerContext.empty(),
    private overrides: Module<any>[],
    private eager: Module<any>[],
  ) {
    overrides.forEach(m => this.containerContext.override(m));
    eager.forEach(m => this.containerContext.eagerLoad(m));
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    return this.containerContext.get(moduleInstance, name);
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    return this.containerContext.materializeModule(module, this.containerContext);
  }

  getContext(): ContainerContext {
    return this.containerContext;
  }

  usingNewRequestScope(): Container {
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
  eager = [], // TODO: eager means that modules are eagerly added to context (in order to enable reflection), but no instances are created. This may be confusing.
}: //       on the other hand how to create instances of definitions ? should we only create singletons ? what
//       about transient, request scopes. This would be pointless.
//       Probably we should not allow any reflection
ContainerOptions = {}): Container {
  const container = new Container(context, overrides, eager);
  return container as any;
}

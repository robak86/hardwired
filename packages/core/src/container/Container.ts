import { ContainerContext } from './ContainerContext';
import { Module } from '../resolvers/abstract/Module';
import { ModulePatch } from '../resolvers/abstract/ModulePatch';

export class Container {
  constructor(
    private readonly containerContext: ContainerContext,
    private readonly overrides: ModulePatch<any>[],
    private readonly eager: Module<any>[],
  ) {
    eager.forEach(m => this.containerContext.eagerLoad(m));
  }

  get<TLazyModule extends Module<any>, K extends Module.InstancesKeys<TLazyModule> & string>(
    moduleInstance: TLazyModule,
    name: K,
  ): Module.Materialized<TLazyModule>[K] {
    return this.containerContext.get(moduleInstance, name);
  }

  asObject<TModule extends Module<any>>(module: TModule): Module.Materialized<TModule> {
    return this.containerContext.materializeModule(module, this.containerContext.forNewRequest());
  }

  usingNewRequestScope(): Container {
    return new Container(this.containerContext.forNewRequest(), [], []);
  }

  checkoutChildScope(...patches: ModulePatch<any>[]): Container {
    return new Container(this.containerContext.childScope(patches), [], []);
  }
}

// TODO: we need to have ability to provide patches which are not overridable by patches provided to nested scopes (testing!)
// or just clear distinction that patches provided to container are irreplaceable by patches provided to scopes
export type ContainerOptions = {
  overrides?: ModulePatch<any>[];
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
// TODO: rename eager -> load|discoverable ? this could be use for instantiating definitions with some tag
ContainerOptions = {}): Container {
  const container = new Container(ContainerContext.withOverrides(overrides), overrides, eager);
  return container as any;
}

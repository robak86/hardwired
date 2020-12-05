import { AbstractModuleResolver, BoundResolver } from "./abstract/AbstractResolvers";
import { ModuleBuilder } from "../module/ModuleBuilder";
import { ContainerContext } from "../container/ContainerContext";
import { createResolverId } from "../utils/fastId";
import { ModuleId } from "../module/ModuleId";
import invariant from "tiny-invariant";
import { ImmutableSet } from "../collections/ImmutableSet";

export class ModuleResolver extends AbstractModuleResolver<any, any> {
  public readonly id: string = createResolverId();

  kind: 'moduleResolver' = 'moduleResolver';

  constructor(private module: ModuleBuilder<any>) {
    super();
  }

  build(path: string, context: ContainerContext, deps: any, injections = ImmutableSet.empty()) {
    const pathParts = path.split('.');
    invariant(pathParts.length === 1 || pathParts.length === 2, `Module builder called with wrong path ${path}`);
    const [moduleOrInstanceKey, instanceKey] = pathParts;

    const resolver: BoundResolver = this.module.registry.get(moduleOrInstanceKey);
    const depsInstances = resolver.dependencies.map(path => this.build(path, context, deps)); // TODO: isn't infinite ?

    // TODO: add handling of injections

    if (resolver.resolver.kind === 'instanceResolver') {
      return resolver.resolver.build(context, depsInstances);
    }

    if (resolver.resolver.kind === 'moduleResolver') {
      return resolver.resolver.build(instanceKey, context, depsInstances, injections);
    }
  }

  get moduleId(): ModuleId {
    return this.module.moduleId;
  }
}

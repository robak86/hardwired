import { AbstractModuleResolver, BoundResolver } from "./abstract/AbstractResolvers";
import { ModuleBuilder, ModuleEntry } from "../module/ModuleBuilder";
import { ContainerContext } from "../container/ContainerContext";
import { createResolverId } from "../utils/fastId";
import { ModuleId } from "../module/ModuleId";
import invariant from "tiny-invariant";
import { ImmutableSet } from "../collections/ImmutableSet";
import { Thunk, unwrapThunk } from "../utils/Thunk";
import memo from "memoize-one";

// export class ModuleResolver extends AbstractModuleResolver<any> {
//   public readonly id: string = createResolverId();
//
//   kind: 'moduleResolver' = 'moduleResolver';
//   private getModule: () => ModuleBuilder<any>;
//
//   constructor(module: Thunk<ModuleBuilder<any>>) {
//     super();
//     this.getModule = memo(() => unwrapThunk(module));
//   }
//
//   build(path: string, context: ContainerContext, deps: any, injections = ImmutableSet.empty()) {
//     const pathParts = path.split('.');
//     invariant(pathParts.length === 1 || pathParts.length === 2, `Module builder called with wrong path ${path}`);
//     const [moduleOrInstanceKey, instanceKey] = pathParts;
//
//     const resolver: BoundResolver = this.getModule().registry.get(moduleOrInstanceKey);
//
//     // TODO: add handling of injections
//
//     if (resolver.resolver.kind === 'instanceResolver') {
//       const depsInstances = resolver.dependencies.map(path => this.build(path, context, deps)); // TODO: isn't infinite ?
//       return resolver.resolver.build(context, depsInstances);
//     }
//
//     if (resolver.resolver.kind === 'moduleResolver') {
//       // TODO: since modules can be lazily loaded into container, then we cannot pass any dependencies to module resolver itself :/
//       return resolver.resolver.build(instanceKey, context, [], injections);
//     }
//   }
//
//   get moduleId(): ModuleId {
//     return this.getModule().moduleId;
//   }
// }

// TODO: TValue should extend base class ModuleEntries<TRecord>
// export const moduleImport = <TValue extends Record<string, ModuleEntry>>(
//   value: Thunk<TValue>,
// ): AbstractModuleResolver<TValue> => {
//   return new ModuleResolver(value);
// };

import { DefinitionsSet, DependencyResolver, ModuleRegistry } from '..';
import { ContainerCache } from '../container/container-cache';
import { createResolverId } from '../utils/fastId';

export abstract class BaseDependencyResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TRegistry> {
  public id: string = createResolverId();

  abstract type: string;
  abstract build(registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx);
}

// export function buildBaseDependencyResolver<TType extends string>(type: TType) {
//    const A = class <TRegistry extends ModuleRegistry, TReturn> extends BaseDependencyResolver<
//       TRegistry,
//       TReturn
//       > {
//     static type: TType = type;
//     readonly type: TType = type;
//   }
//
//   return NamedBaseDependencyResolver;
// }

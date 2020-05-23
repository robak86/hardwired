import { nextId } from '../utils/fastId';
import { ContainerCache } from '../container/container-cache';
import { proxyGetter } from '../container/proxyGetter';
import { DependencyResolver } from './DependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { DefinitionsSet } from '../module/DefinitionsSet';

export class ClassTransientResolverResolver<TRegistry extends ModuleRegistry, TReturn = any>
  implements DependencyResolver<TRegistry, TReturn> {
  static type = 'singleton';

  public id: string = nextId();
  public type = ClassTransientResolverResolver.type;

  constructor(private klass, private selectDependencies = container => [] as any[]) {}

  build = (registry: DefinitionsSet<TRegistry>, cache: ContainerCache, ctx) => {
    const constructorArgs = this.selectDependencies(proxyGetter(registry, cache, ctx)) as any;
    return new this.klass(...constructorArgs);
  };
}

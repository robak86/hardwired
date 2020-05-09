import { ModuleRegistry } from '../module/ModuleRegistry';
import { DependencyResolver, DependencyResolverFunction } from './DependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { containerProxyAccessor } from '../container/container-proxy-accessor';
import { Container } from '../container/Container';

export class TransientResolver<TRegistry extends ModuleRegistry, TReturn>
  implements DependencyResolver<TRegistry, TReturn> {
  constructor(private resolver: DependencyResolverFunction<TRegistry, TReturn>) {}

  build(container: Container<TRegistry>, ctx, cache: ContainerCache): TReturn {
    return this.resolver(containerProxyAccessor(container, cache));
  }
}

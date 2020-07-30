import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ContainerCache } from '../container/container-cache';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ContainerService } from '../container/ContainerService';


export class TransientResolver<TKey extends string, TReturn> extends AbstractDependencyResolver<TKey, TReturn> {
  constructor(key: TKey, private resolver: any) {
    super(key);
  }

  build(registry: ModuleRegistry<any>, cache: ContainerCache, ctx): TReturn {
    return this.resolver(ContainerService.proxyGetter(registry, cache, ctx));
  }
}

export const transient = <TKey extends string, TValue>(key: TKey, value: () => TValue): TransientResolver<TKey, TValue> => {
  return new TransientResolver(key, value);
};

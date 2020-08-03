import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ContainerService } from '../container/ContainerService';
import { DependencyFactory } from '../draft';

export class TransientResolver<TKey extends string, TReturn> extends AbstractDependencyResolver<TKey, TReturn> {
  constructor(key: TKey, private resolver: any) {
    super(key);
  }

  build(registry: ModuleRegistry<any>): DependencyFactory<TReturn> {
    return cache => this.resolver(ContainerService.proxyGetter(registry, cache, {}));
  }
}

export const transient = <TKey extends string, TValue>(
  key: TKey,
  value: () => TValue,
): TransientResolver<TKey, TValue> => {
  return new TransientResolver(key, value);
};

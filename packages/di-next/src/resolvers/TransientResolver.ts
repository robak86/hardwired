import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ModuleRegistry } from '../module/ModuleRegistry';
import { ContainerService } from '../container/ContainerService';
import { DependencyFactory } from '../draft';

export class TransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private resolver: any) {
    super();
  }

  build(registry: ModuleRegistry<any>): DependencyFactory<TReturn> {
    return cache => this.resolver(ContainerService.proxyGetter(registry, cache, {}));
  }
}

export const transient = <TKey extends string, TValue>(
  key: TKey,
  value: () => TValue,
): TransientResolver<TValue> => {
  return new TransientResolver(value);
};

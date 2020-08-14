import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ContainerCache } from '../container/container-cache';

export class TransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private resolver: () => TReturn) {
    super();
  }

  build(cache: ContainerCache): TReturn {
    return this.resolver();
  }
}

export const transient = <TKey extends string, TValue>(key: TKey, value: () => TValue): TransientResolver<TValue> => {
  return new TransientResolver(value);
};

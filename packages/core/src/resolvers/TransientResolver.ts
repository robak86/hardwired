import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';

export class TransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private resolver: () => TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.resolver();
  }
}

export const transient = <TKey extends string, TValue>(key: TKey, value: () => TValue): TransientResolver<TValue> => {
  return new TransientResolver(value);
};

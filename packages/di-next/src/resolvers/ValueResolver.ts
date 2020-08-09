import { AbstractDependencyResolver } from './AbstractDependencyResolver';
import { ContainerCache } from '../container/container-cache';

export class ValueResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private value: TReturn) {
    super();
  }

  build(cache: ContainerCache): TReturn {
    return this.value;
  }
}

export const value = <TKey extends string, TValue>(key: TKey, value: TValue): ValueResolver<TValue> => {
  return new ValueResolver(value);
};

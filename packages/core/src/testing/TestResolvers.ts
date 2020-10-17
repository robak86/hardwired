import { AbstractDependencyResolver } from '../resolvers/abstract/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { ModuleLookup } from '../module/ModuleLookup';

export class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
  constructor(private value: TValue) {
    super();
  }

  build(cache: ContainerContext): TValue {
    return this.value;
  }
  onInit(lookup: ModuleLookup<any>) {
    return undefined;
  }
}

export const dependency = <TValue>(value: TValue): DummyResolver<TValue> => {
  return new DummyResolver<TValue>(value);
};

export class TestTransientResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private resolver: () => TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.resolver();
  }
}

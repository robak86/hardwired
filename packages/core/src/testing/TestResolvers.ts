import { ContainerContext } from "../container/ContainerContext";
import { ModuleLookup } from "../module/ModuleLookup";
import { Instance } from "../resolvers/abstract/AbstractResolvers";

export class DummyResolver<TValue> extends Instance<TValue, []> {
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

export class TestTransientResolver<TReturn> extends Instance<TReturn, []> {
  constructor(private resolver: () => TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.resolver();
  }
}

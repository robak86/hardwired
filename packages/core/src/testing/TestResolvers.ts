import { ContainerContext } from "../container/ContainerContext";
import { Instance } from "../resolvers/abstract/AbstractResolvers";
import { ContainerEvents } from "../container/ContainerEvents";

export class DummyResolver<TValue> extends Instance<TValue, []> {
  constructor(private value: TValue) {
    super();
  }

  build(cache: ContainerContext): TValue {
    return this.value;
  }
  onInit(lookup: ContainerEvents) {
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

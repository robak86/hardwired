import { ContainerContext } from "../container/ContainerContext";
import { ContainerEvents } from "../container/ContainerEvents";
import { Instance } from "../resolvers/abstract/Instance";

export class DummyResolver<TValue> extends Instance<TValue, []> {
  constructor(private value: TValue) {
    super();
  }

  build(cache: ContainerContext): TValue {
    return this.value;
  }
  onInit(lookup: ContainerContext) {
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

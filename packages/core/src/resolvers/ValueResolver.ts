import { AbstractDependencyResolver } from "./abstract/AbstractDependencyResolver";
import { ContainerContext } from "../container/ContainerContext";

export class ValueResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private value: TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.value;
  }
}

export const value = <TValue>(value: TValue): ValueResolver<TValue> => {
  return new ValueResolver(value);
};

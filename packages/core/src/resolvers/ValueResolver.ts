import { ContainerContext } from "../container/ContainerContext";
import { AbstractInstanceResolver } from "./abstract/AbstractResolvers";

export class ValueResolver<TReturn> extends AbstractInstanceResolver<TReturn, []> {
  constructor(private value: TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.value;
  }
}

export function value<TDeps extends any[], TValue>(value: TValue): ValueResolver<TValue> {
  return new ValueResolver(value);
}

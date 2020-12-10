import { ContainerContext } from '../container/ContainerContext';
import { Instance } from "./abstract/Instance";

export class ValueResolver<TReturn> extends Instance<TReturn, []> {
  constructor(private value: TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.value;
  }
}

export function value<TDeps extends any[], TValue>(value: TValue): Instance<TValue, []> {
  return new ValueResolver(value);
}

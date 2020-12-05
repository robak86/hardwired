import { AbstractDependencyResolver } from "./abstract/AbstractDependencyResolver";
import { ContainerContext } from "../container/ContainerContext";
import { AbstractInstanceResolver } from "../module/ModuleBuilder";
import { ClassType } from "../utils/ClassType";
import { ClassTransientResolverNew } from "./ClassTransientResolver";

export class ValueResolver<TReturn> extends AbstractDependencyResolver<TReturn> {
  constructor(private value: TReturn) {
    super();
  }

  build(cache: ContainerContext): TReturn {
    return this.value;
  }
}

export class ValueResolverNew<TReturn> extends AbstractInstanceResolver<TReturn, []> {
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

export function transientNew<TDeps extends any[], TValue>(
  value: TValue,
): ValueResolverNew<TValue> {
  return new ValueResolverNew(value);
}

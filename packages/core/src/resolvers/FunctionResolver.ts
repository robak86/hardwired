import { curry } from "../utils/curry";
import { ContainerContext } from "../container/ContainerContext";
import { PartiallyApplied } from "../utils/PartiallyApplied";
import { PartiallyAppliedArgs } from "../utils/PartiallyAppliedArgs";
import { Instance } from "./abstract/Instance";

export class FunctionResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  private readonly curriedFunction;
  private readonly unCurriedFunction;
  private previousDependencies: any[] = [];

  constructor(fn: (...args: any[]) => any) {
    super();
    this.unCurriedFunction = fn;
    this.curriedFunction = curry(fn);
  }

  build(cache: ContainerContext, _): TReturn {

    const currentDependencies = this.dependencies.map(d => d.build(cache, []));

    const requiresRevalidation = currentDependencies.some(
      (val, idx) => val !== this.previousDependencies[idx],
    );

    if (requiresRevalidation) {
      this.previousDependencies = currentDependencies;
      const instance = this.buildFunction(currentDependencies);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }

    if (cache.hasInGlobalScope(this.id)) {
      return cache.getFromGlobalScope(this.id);
    } else {
      const instance = this.buildFunction(currentDependencies);
      cache.setForGlobalScope(this.id, instance);
      return instance;
    }
  }

  private buildFunction(params) {
    if (params.length === this.unCurriedFunction.length) {
      return () => this.unCurriedFunction(...params);
    } else {
      return this.curriedFunction(...params);
    }
  }
}

export function func<TValue extends (...args: any[]) => any, TDepth extends 0 | 1 | 2 | 3 | 4>(
  cls: TValue,
  depth: TDepth,
): Instance<PartiallyApplied<TValue, TDepth>, PartiallyAppliedArgs<TValue, TDepth>> {
  return new FunctionResolver(cls);
}

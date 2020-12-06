import { curry } from '../utils/curry';
import { AbstractDependencyResolver } from './abstract/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { InstanceLegacy } from './abstract/InstanceLegacy';
import Parameters = jest.Parameters;
import { ClassType } from '../utils/ClassType';
import { ClassRequestResolver } from './ClassRequestResolver';
import { Instance } from './abstract/AbstractResolvers';

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class FunctionResolver<TReturn, TDeps extends any[]> extends Instance<TReturn, TDeps> {
  private readonly curriedFunction;
  private readonly uncurriedFunction;
  private previousDependencies: any[] = [];

  constructor(fn: (...args: any[]) => any) {
    super();
    this.uncurriedFunction = fn;
    this.curriedFunction = curry(fn);
  }

  build(cache: ContainerContext, currentDependencies): TReturn {
    const requiresRevalidation = currentDependencies.some((val, idx) => val !== this.previousDependencies[idx]);

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
    if (params.length === this.uncurriedFunction.length) {
      return () => this.uncurriedFunction(...params);
    } else {
      return this.curriedFunction(...params);
    }
  }
}

type Wtf = PartiallyApplied<(a: number, b: string, c: boolean) => number, 0>;
type Wtf1 = PartiallyApplied<(a: number, b: string, c: boolean) => number, 1>;
type Wtf2 = PartiallyApplied<(a: number, b: string, c: boolean) => number, 2>;
type Wtf3 = PartiallyApplied<(a: number, b: string, c: boolean) => number, 3>;

// prettier-ignore
type PartiallyApplied<TFunc extends (...args:any[]) => any, TDepth extends 0 | 1 | 2 | 3> =
 0 extends  TDepth ? TFunc :
 1 extends  TDepth ? PartiallyApplied1<Parameters<TFunc>, ReturnType<TFunc>> :
 2 extends  TDepth ? PartiallyApplied2<Parameters<TFunc>, ReturnType<TFunc>> :
 3 extends  TDepth ? PartiallyApplied3<Parameters<TFunc>, ReturnType<TFunc>> : never

// prettier-ignore
type PartiallyApplied1<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, ...infer TRest] ? (...rest:TRest) => TReturn : 'args count mismatch'

// prettier-ignore
type PartiallyApplied2<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2, ...infer TRest] ? (...rest:TRest) => TReturn : 'args count mismatch'

// prettier-ignore
type PartiallyApplied3<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2,infer TArg3, ...infer TRest] ?  (...rest:TRest) => TReturn : 'args count mismatch'

// prettier-ignore
type PartiallyAppliedArgs<TFunc extends (...args:any[]) => any, TDepth extends 0 | 1 | 2 | 3> =
  0 extends  TDepth ? [] :
    1 extends  TDepth ? PartiallyAppliedArgs1<Parameters<TFunc>, ReturnType<TFunc>> :
      2 extends  TDepth ? PartiallyAppliedArgs2<Parameters<TFunc>, ReturnType<TFunc>> :
        3 extends  TDepth ? PartiallyAppliedArgs3<Parameters<TFunc>, ReturnType<TFunc>> : never

// prettier-ignore
type PartiallyAppliedArgs1<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, ...infer TRest] ? [TArg1] : []

// prettier-ignore
type PartiallyAppliedArgs2<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2, ...infer TRest] ? [TArg1, TArg2] : []

// prettier-ignore
type PartiallyAppliedArgs3<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2,infer TArg3, ...infer TRest] ?  [TArg1, TArg2, TArg3] : []

export function func<TValue extends (...args: any[]) => any, TDepth extends 0 | 1 | 2 | 3>(
  cls: TValue,
  depth: TDepth,
): ClassRequestResolver<PartiallyApplied<TValue, TDepth>, PartiallyAppliedArgs<TValue, TDepth>> {
  return new ClassRequestResolver(cls);
}

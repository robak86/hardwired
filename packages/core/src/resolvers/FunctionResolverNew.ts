import { curry } from '../utils/curry';
import { AbstractDependencyResolver } from './abstract/AbstractDependencyResolver';
import { ContainerContext } from '../container/ContainerContext';
import { Instance } from './abstract/Instance';
import Parameters = jest.Parameters;
import { AbstractInstanceResolver } from '../module/ModuleBuilder';
import { ClassType } from '../utils/ClassType';
import { ClassRequestResolverNew } from './ClassRequestResolver';

// TODO: not sure if this should be singleton ?
//  or we should memoize the function by dependencySelect ?  +1
//  or it shouldn't never be memoized ?
export class FunctionResolver<TReturn, TDeps extends any[]> extends AbstractInstanceResolver<TReturn, TDeps> {
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
  TArgs extends [infer TArg1, ...infer TRest] ? (...args: [TArg1]) => (...rest:TRest) => TReturn : 'args count mismatch'

// prettier-ignore
type PartiallyApplied2<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2, ...infer TRest] ? (...args: [TArg1, TArg2]) => (...rest:TRest) => TReturn : 'args count mismatch'

// prettier-ignore
type PartiallyApplied3<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2,infer TArg3, ...infer TRest] ? (...args: [TArg1, TArg2, TArg3]) => (...rest:TRest) => TReturn : 'args count mismatch'

export function func<TDeps extends any[], TValue extends (...args: any[]) => any, TDepth extends 0 | 1 | 2 | 3>(
  cls: TValue,
  depth: TDepth,
): ClassRequestResolverNew<PartiallyApplied<TValue, TDepth>, TDeps> {
  return new ClassRequestResolverNew(cls);
}

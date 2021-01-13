// prettier-ignore
export type PartiallyApplied<TFunc extends (...args:any[]) => any, TDepth extends 0 | 1 | 2 | 3 | 4> =
  0 extends  TDepth ? TFunc :
    1 extends  TDepth ? PartiallyApplied1<Parameters<TFunc>, ReturnType<TFunc>> :
      2 extends  TDepth ? PartiallyApplied2<Parameters<TFunc>, ReturnType<TFunc>> :
        3 extends  TDepth ? PartiallyApplied3<Parameters<TFunc>, ReturnType<TFunc>> :
          4 extends  TDepth ? PartiallyApplied4<Parameters<TFunc>, ReturnType<TFunc>> : never

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
type PartiallyApplied4<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2,infer TArg3, infer TArg4, ...infer TRest] ?  (...rest:TRest) => TReturn : 'args count mismatch'

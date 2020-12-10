// prettier-ignore
export type PartiallyAppliedArgs<TFunc extends (...args:any[]) => any, TDepth extends 0 | 1 | 2 | 3 | 4> =
  0 extends  TDepth ? [] :
    1 extends  TDepth ? PartiallyAppliedArgs1<Parameters<TFunc>, ReturnType<TFunc>> :
      2 extends  TDepth ? PartiallyAppliedArgs2<Parameters<TFunc>, ReturnType<TFunc>> :
        3 extends  TDepth ? PartiallyAppliedArgs3<Parameters<TFunc>, ReturnType<TFunc>> :
        4 extends  TDepth ? PartiallyAppliedArgs4<Parameters<TFunc>, ReturnType<TFunc>> : never

// prettier-ignore
type PartiallyAppliedArgs1<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, ...infer TRest] ? [TArg1] : []

// prettier-ignore
type PartiallyAppliedArgs2<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2, ...infer TRest] ? [TArg1, TArg2] : []

// prettier-ignore
type PartiallyAppliedArgs3<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2,infer TArg3, ...infer TRest] ?  [TArg1, TArg2, TArg3] : []

// prettier-ignore
type PartiallyAppliedArgs4<TArgs extends any[], TReturn> =
  TArgs extends [infer TArg1, infer TArg2,infer TArg3,infer TArg4, ...infer TRest] ?  [TArg1, TArg2, TArg3] : []

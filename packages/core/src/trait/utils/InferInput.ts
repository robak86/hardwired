import { Diff } from 'utility-types';


// TODO: pretty types - union to intersection + [K in keyof T]: T[K]
export type InferInput<
  TCurrentInput extends object,
  TCurrentOutput extends object,
  TNextInput extends object
> = TCurrentOutput extends TNextInput ? TCurrentInput : TCurrentInput & Diff<TNextInput, TCurrentOutput>;

export type InferInput2<
  TCurrentInput1 extends object,
  TCurrentOutput1 extends object,
  TCurrentInput2 extends object,
  TCurrentOutput2 extends object,
  TNextInput extends object
> = InferInput<InferInput<TCurrentInput1, TCurrentInput2, TCurrentInput1>, TCurrentOutput2, TNextInput>;

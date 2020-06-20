import { InferInput, InferInput2 } from '../utils/InferInput';
import { Trait, TraitAsync } from '../trait';

export type TraitComposeAsync = {
  <TInput1 extends object, TOutput1 extends TInput1, TInput2 extends object, TOutput2 extends TInput2>(
    ...traits: [
      Trait<TInput1, TOutput1, any> | TraitAsync<TInput1, TOutput1, any>,
      Trait<TInput2, TOutput2, any> | TraitAsync<TInput2, TOutput2, any>,
    ]
  ): TraitAsync<
    InferInput<TInput1, TOutput1, TInput2>,
    InferInput<TInput1, TOutput1, TInput2> & TOutput2 & TOutput1,
    never
  >;

  <
    TInput1 extends object,
    TOutput1 extends TInput1,
    TInput2 extends object,
    TOutput2 extends TInput2,
    TInput3 extends object,
    TOutput3 extends TInput3
  >(
    ...traits: [
      Trait<TInput1, TOutput1, any> | TraitAsync<TInput1, TOutput1, any>,
      Trait<TInput2, TOutput2, any> | TraitAsync<TInput2, TOutput2, any>,
      Trait<TInput3, TOutput3, any> | TraitAsync<TInput3, TOutput3, any>,
    ]
  ): TraitAsync<
    InferInput2<TInput1, TOutput1, TInput2, TOutput2, TInput3>,
    InferInput2<TInput1, TOutput1, TInput2, TOutput2, TInput3> & TOutput2 & TOutput1,
    never
  >;
};

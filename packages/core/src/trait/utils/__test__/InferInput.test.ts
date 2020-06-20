import { InferInput } from '../InferInput';
import { expectType, TypeEqual } from 'ts-expect';

describe(`InferInput`, () => {
  it(`does not extend TCurrentInput if all properties are present in NextInput`, async () => {
    type CurrentInput = { t1: number };
    type CurrentOutput = { t2: number };
    type NextInput = { t1: number };

    type Input = InferInput<CurrentInput, CurrentOutput, NextInput>;
    expectType<TypeEqual<Input, CurrentInput>>(true);
  });

  it(`extend TCurrentInput with missing properties from`, async () => {
    type CurrentInput = { t1: number };
    type CurrentOutput = { t2: number };
    type NextInput = { t1: number; t3: number };

    type Input = InferInput<CurrentInput, CurrentOutput, NextInput>;
    expectType<TypeEqual<Input, { t1: number; t3: number }>>(true);
  });
});

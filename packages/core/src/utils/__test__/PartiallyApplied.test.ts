import { expectType, TypeEqual } from 'ts-expect';
import { PartiallyApplied } from '../PartiallyApplied.js';
import { describe, it, expect, vi } from 'vitest';

describe(`PartiallyApplied`, () => {
  it(`returns correct type if no args are provided`, async () => {
    type FullyApplied = PartiallyApplied<[1, 2, number], [], 'returnType'>;
    expectType<TypeEqual<FullyApplied, (a1: 1, a2: 2, a3: number) => 'returnType'>>(true);
  });

  it(`returns correct type if all args are provided`, async () => {
    type FullyApplied = PartiallyApplied<[1, 2, number], [1, 2, number], 'returnType'>;
    expectType<TypeEqual<FullyApplied, () => 'returnType'>>(true);
  });

  it(`returns correct type if all args are provided, ex.2`, async () => {
    type FullyApplied = PartiallyApplied<[number, string, boolean], [number, string, boolean], 'returnType'>;
    expectType<TypeEqual<FullyApplied, () => 'returnType'>>(true);
  });

  it(`returns correct type if function has no args`, async () => {
    type FullyApplied = PartiallyApplied<[], [], 'returnType'>;
    expectType<TypeEqual<FullyApplied, () => 'returnType'>>(true);
  });

  it(`returns correct type for partial args`, async () => {
    type Applied = PartiallyApplied<[number, string, boolean], [number, string], 'returnType'>;
    expectType<TypeEqual<Applied, (arg: boolean) => 'returnType'>>(true);
  });

  it(`returns error if partial args don't have correct types`, async () => {
    // @ts-expect-error wrong_type is not applicable to number
    type Applied = PartiallyApplied<[number, string, boolean], ['wrong_type'], 'returnType'>;
  });
});

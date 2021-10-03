import { value } from '../strategies';
import { partiallyAppliedSingleton } from '../fnStrategies';
import { expectType, TypeEqual } from 'ts-expect';
import { PartiallyAppliedFunctionDefinition } from '../../abstract/InstanceDefinition/PartiallyAppliedFunctionDefinition';

describe(`fnStrategies`, () => {
  describe(`partiallyAppliedSingleton`, () => {
    it(`returns correct type for fully applied function`, async () => {
      const a = value(1);
      const b = value('str');
      const ap = partiallyAppliedSingleton((a: number, b: string) => true, a, b);
      expectType<TypeEqual<typeof ap, PartiallyAppliedFunctionDefinition<() => boolean, never, never>>>(true);
    });

    it(`returns correct type for partially applied function`, async () => {
      const a = value(1);
      const b = value('str');
      const ap = partiallyAppliedSingleton((a: number, b: string) => true, a);
      expectType<TypeEqual<typeof ap, PartiallyAppliedFunctionDefinition<(b: string) => boolean, never, never>>>(true);
    });

    it(`returns correct type for no args passed`, async () => {
      const ap = partiallyAppliedSingleton((a: number, b: string) => true);
      expectType<
        TypeEqual<typeof ap, PartiallyAppliedFunctionDefinition<(a: number, b: string) => boolean, never, never>>
      >(true);
    });
  });
});

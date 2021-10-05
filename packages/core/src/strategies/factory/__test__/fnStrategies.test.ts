import { singleton, value } from '../strategies';

import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/InstanceDefinition';

describe(`fnStrategies`, () => {
  describe(`partiallyAppliedSingleton`, () => {
    it(`returns correct type for fully applied function`, async () => {
      const a = value(1);
      const b = value('str');
      const ap = singleton.partial((a: number, b: string) => true, a, b);
      expectType<TypeEqual<typeof ap, InstanceDefinition<() => boolean, never>>>(true);
    });

    it(`returns correct type for partially applied function`, async () => {
      const a = value(1);
      const b = value('str');
      const ap = singleton.partial((a: number, b: string) => true, a);
      expectType<TypeEqual<typeof ap, InstanceDefinition<(b: string) => boolean, never>>>(true);
    });

    it(`returns correct type for no args passed`, async () => {
      const ap = singleton.partial((a: number, b: string) => true);
      expectType<TypeEqual<typeof ap, InstanceDefinition<(a: number, b: string) => boolean, never>>>(true);
    });
  });
});

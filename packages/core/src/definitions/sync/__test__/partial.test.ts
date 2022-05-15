import { request, singleton, transient } from '../../definitions.js';

import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/sync/InstanceDefinition.js';
import { value } from '../value.js';
import { container } from '../../../container/Container.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { external } from '../external.js';
import { fn } from '../fn.js';
import { partial } from '../partial.js';

describe(`partial`, () => {
  describe(`types`, () => {
    describe(`single function`, () => {
      it(`returns correct type for fully applied function`, async () => {
        const a = value(1);
        const b = value('str');
        const ap = singleton.partial((a: number, b: string) => true, a, b);
        expectType<TypeEqual<typeof ap, InstanceDefinition<() => boolean, LifeTime.singleton, never>>>(true);
      });

      it(`returns correct type for partially applied function`, async () => {
        const a = value(1);
        const b = value('str');
        const ap = singleton.partial((a: number, b: string) => true, a);
        expectType<TypeEqual<typeof ap, InstanceDefinition<(b: string) => boolean, LifeTime.singleton, never>>>(true);
      });

      it(`returns correct type for no args passed`, async () => {
        const ap = singleton.partial((a: number, b: string) => true);
        expectType<
          TypeEqual<typeof ap, InstanceDefinition<(a: number, b: string) => boolean, LifeTime.singleton, never>>
        >(true);
      });
    });

    describe(`curried functions`, () => {
      it(`returns correct type for fully applied function`, async () => {
        const a = value(1);
        const b = value('str');
        const ap = singleton.partial((a: number) => (b: string) => true, a, b);
        expectType<TypeEqual<typeof ap, InstanceDefinition<() => boolean, LifeTime.singleton, never>>>(true);
      });

      it(`returns correct type for partially applied function`, async () => {
        const a = value(1);
        const b = value('str');
        const ap = singleton.partial((a: number) => (b: string) => true, a);
        expectType<TypeEqual<typeof ap, InstanceDefinition<(b: string) => boolean, LifeTime.singleton, never>>>(true);
      });

      it(`returns correct type for no args passed`, async () => {
        const ap = singleton.partial((a: number) => (b: string) => true);
        expectType<
          TypeEqual<typeof ap, InstanceDefinition<(a: number, b: string) => boolean, LifeTime.singleton, never>>
        >(true);
      });
    });

    describe(`allowed dependencies life times`, () => {
      const numberConsumer = (val: number) => val;

      const ext = external('number').type<number>();

      describe(`transient`, () => {
        it(`does not accept singletons with externals`, async () => {
          const buildDef = () => {
            const dep = singleton.fn(val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            partial(LifeTime.transient)(numberConsumer, dep);
          };
          expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request def with externals`, async () => {
          const dep = request.fn(val => val, ext);
          partial(LifeTime.transient)(numberConsumer, dep);
        });

        it(`accepts transient with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          partial(LifeTime.transient)(numberConsumer, dep);
        });
      });

      describe(`request`, () => {
        it(`does not accept singletons with externals`, async () => {
          const buildDef = () => {
            const dep = singleton.fn(val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            partial(LifeTime.request)(numberConsumer, dep);
          };

          expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request dependency def with externals`, async () => {
          const dep = request.fn(val => val, ext);
          partial(LifeTime.request)(numberConsumer, dep);
        });

        it(`accepts transient dependency with externals`, async () => {
          const dep = transient.fn(val => val, ext);
          partial(LifeTime.request)(numberConsumer, dep);
        });
      });

      describe(`singleton`, () => {
        it(`does not accept singletons with externals`, async () => {
          const buildDef = () => {
            const dep = singleton.fn(val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            partial(LifeTime.singleton)(numberConsumer, dep);
          };
          expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts request def with externals`, async () => {
          const buildDef = () => {
            const dep = request.fn(val => val, ext);
            partial(LifeTime.singleton)(numberConsumer, dep);
          };

          expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
        });

        it(`accepts transient with externals`, async () => {
          const buildDef = () => {
            const dep = transient.fn(val => val, ext);
            partial(LifeTime.singleton)(numberConsumer, dep);
          };
          expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
        });
      });
    });
  });

  describe(`singleton`, () => {
    describe(`no args`, () => {
      describe(`no currying`, () => {
        it(`returns correct function`, async () => {
          const noArgsFn = singleton.partial(() => 123);
          const result = container().get(noArgsFn);
          expect(result()).toEqual(123);
          expectType<TypeEqual<typeof result, () => number>>(true);
        });

        it(`returns the same instance of function`, async () => {
          const noArgsFn = singleton.partial(() => 123);
          const cnt = container();
          const result1 = cnt.get(noArgsFn);
          const result2 = cnt.get(noArgsFn);
          expect(result1).toBe(result2);
        });
      });

      describe(`with currying`, () => {
        it(`returns correct function`, async () => {
          const noArgsFn = singleton.partial(() => () => 123);
          const result = container().get(noArgsFn);
          expect(result()).toEqual(123);
          expectType<TypeEqual<typeof result, () => number>>(true);
        });

        it(`returns the same instance of function`, async () => {
          const noArgsFn = singleton.partial(() => () => 123);
          const cnt = container();
          const result1 = cnt.get(noArgsFn);
          const result2 = cnt.get(noArgsFn);
          expect(result1).toBe(result2);
        });
      });
    });

    describe(`fully applied`, () => {
      describe(`without uncurrying`, () => {
        it(`returns correct function`, async () => {
          const someNumber = value(123);
          const someString = value('str');
          const fullyApplied = singleton.partial((a: number, b: string) => [a, b] as const, someNumber, someString);
          const result = container().get(fullyApplied);
          expect(result()).toEqual([123, 'str']);
          expectType<TypeEqual<typeof result, () => readonly [number, string]>>(true);
        });

        it(`returns the same instance of function`, async () => {
          const someNumber = value(123);
          const someString = value('str');
          const fullyApplied = singleton.partial((a: number, b: string) => [a, b] as const, someNumber, someString);
          const cnt = container();

          const result1 = cnt.get(fullyApplied);
          const result2 = cnt.get(fullyApplied);
          expect(result1).toBe(result2);
        });
      });
    });

    describe(`partially applied`, () => {
      it(`returns correct function`, async () => {
        const someNumber = value(123);
        const partApplied = singleton.partial((a: number, b: string) => [a, b] as const, someNumber);
        const result = container().get(partApplied);
        expect(result('str')).toEqual([123, 'str']);
        expectType<TypeEqual<typeof result, (b: string) => readonly [number, string]>>(true);
      });

      it(`returns the same instance of function`, async () => {
        const someNumber = value(123);
        const partApplied = singleton.partial((a: number, b: string) => [a, b] as const, someNumber);
        const cnt = container();

        const result1 = cnt.get(partApplied);
        const result2 = cnt.get(partApplied);
        expect(result1).toBe(result2);
      });
    });
  });

  describe(`transient`, () => {
    describe(`no args`, () => {
      it(`returns correct function`, async () => {
        const noArgsFn = transient.partial(() => 123);
        const result = container().get(noArgsFn);
        expect(result()).toEqual(123);
        expectType<TypeEqual<typeof result, () => number>>(true);
      });

      it(`returns a new instance of function`, async () => {
        const noArgsFn = transient.partial(() => 123);
        const cnt = container();
        const result1 = cnt.get(noArgsFn);
        const result2 = cnt.get(noArgsFn);
        expect(result1).not.toBe(result2);
      });
    });

    describe(`fully applied`, () => {
      it(`returns correct function`, async () => {
        const someNumber = value(123);
        const someString = value('str');
        const fullyApplied = transient.partial((a: number, b: string) => [a, b] as const, someNumber, someString);
        const result = container().get(fullyApplied);
        expect(result()).toEqual([123, 'str']);
        expectType<TypeEqual<typeof result, () => readonly [number, string]>>(true);
      });

      it(`does not return the same instance of function`, async () => {
        const someNumber = value(123);
        const someString = value('str');
        const fullyApplied = transient.partial((a: number, b: string) => [a, b] as const, someNumber, someString);
        const cnt = container();

        const result1 = cnt.get(fullyApplied);
        const result2 = cnt.get(fullyApplied);
        expect(result1).not.toBe(result2);
      });
    });

    describe(`partially applied`, () => {
      it(`returns correct function`, async () => {
        const someNumber = value(123);
        const partApplied = transient.partial((a: number, b: string) => [a, b] as const, someNumber);
        const result = container().get(partApplied);
        expect(result('str')).toEqual([123, 'str']);
        expectType<TypeEqual<typeof result, (b: string) => readonly [number, string]>>(true);
      });

      it(`does not return the same instance of function`, async () => {
        const someNumber = value(123);
        const partApplied = transient.partial((a: number, b: string) => [a, b] as const, someNumber);
        const cnt = container();

        const result1 = cnt.get(partApplied);
        const result2 = cnt.get(partApplied);
        expect(result1).not.toBe(result2);
      });
    });
  });
});

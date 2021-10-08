import { singleton, transient } from '../../definitions';

import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/InstanceDefinition';
import { value } from '../value';
import { container } from '../../../container/Container';

describe(`partial`, () => {
  describe(`types`, () => {
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

  describe(`singleton`, () => {
    describe(`no args`, () => {
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

    describe(`fully applied`, () => {
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

      it(`returns the same instance of function`, async () => {
        const noArgsFn = transient.partial(() => 123);
        const cnt = container();
        const result1 = cnt.get(noArgsFn);
        const result2 = cnt.get(noArgsFn);
        expect(result1).toBe(result2);
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

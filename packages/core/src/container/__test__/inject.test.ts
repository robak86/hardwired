import { module, unit } from '../../module/ModuleBuilder';
import { inject } from '../inject';
import { container } from '../Container';
import { expectType, TypeEqual } from 'ts-expect';
import { singleton } from '../../strategies/SingletonStrategy';

describe(`inject`, () => {
  describe(`record`, () => {
    describe(`types`, () => {
      it(`returns object with correct types`, async () => {
        const m1 = unit()
          .define('a', singleton, () => 1)
          .define('b', singleton, () => 2)
          .build();

        const m2 = unit()
          .define('a', singleton, () => 10)
          .define('b', singleton, () => 20)
          .build();

        const slice = inject.record({
          a: inject.select(m1, 'a'),
          b: inject.select(() => m2, 'b'),
        });

        expectType<TypeEqual<ReturnType<typeof slice>, { a: number; b: number }>>(true);
      });
    });

    it(`builds function returning correct dependencies`, async () => {
      const m1 = unit()
        .define('a', singleton, () => 1)
        .define('b', singleton, () => 2)
        .build();

      const m2 = unit()
        .define('a', singleton, () => 10)
        .define('b', singleton, () => 20)
        .build();

      const slice = inject.record({
        a: inject.select(m1, 'a'),
        b: inject.select(m2, 'b'),
      });

      const c = container();
      const result = c.select(slice);
      expect(result).toEqual({ a: 1, b: 20 });
    });

    it(`works with thunks`, async () => {
      const m1 = unit()
        .define('a', singleton, () => 1)
        .define('b', singleton, () => 2)
        .build();

      const m2 = unit()
        .define('a', singleton, () => 10)
        .define('b', singleton, () => 20)
        .build();

      const slice = inject.record({
        a: inject.select(() => m1, 'a'),
        b: inject.select(() => m2, 'b'),
      });

      const c = container();
      const result = c.select(slice);
      expect(result).toEqual({ a: 1, b: 20 });
    });
  });

  describe(`tuple`, () => {
    describe(`types`, () => {
      it(`returns object with correct types`, async () => {
        const m1 = unit()
          .define('a', singleton, () => 1)
          .define('b', singleton, () => '2')
          .build();

        const m2 = unit()
          .define('a', singleton, () => 10)
          .define('b', singleton, () => '20')
          .build();

        const slice = inject.tuple(inject.select(m1, 'a'), inject.select(m2, 'b'));

        expectType<TypeEqual<ReturnType<typeof slice>, [number, string]>>(true);
      });
    });

    it(`builds function returning correct dependencies`, async () => {
      const m1 = unit()
        .define('a', singleton, () => 1)
        .define('b', singleton, () => 2)
        .build();

      const m2 = unit()
        .define('a', singleton, () => 10)
        .define('b', singleton, () => 20)
        .build();

      const slice = inject.tuple(inject.select(m1, 'a'), inject.select(m2, 'b'));

      const c = container();
      const result = c.select(slice);
      expect(result).toEqual([1, 20]);
    });
  });

  describe(`asyncRecord`, () => {
    it(`batches all async properties`, async () => {
      const m1 = module()
        .define('p1', singleton, async () => 1)
        .define('p2', singleton, async () => 2)
        .build();
      const m2 = module()
        .define('val1', singleton, () => 10)
        .define('val2', singleton, async () => 20)
        .build();

      const selector = inject.asyncRecord({
        a: inject.select(m1, 'p1'),
        b: inject.select(m1, 'p2'),
        c: inject.select(m2, 'val1'),
      });

      const c = container();
      const selected = await c.select(selector);
      const expected: typeof selected = { a: 1, b: 2, c: 10 };

      expect(selected).toEqual(expected);
    });
  });

  describe(`select`, () => {
    it(`returns error if modules is not defined`, async () => {
      expect(() => inject.select(undefined as any, 'someKey')).toThrowError(
        `Provided module is undefined. It's probably because of circular modules references. Use thunk instead`,
      );
    });
  });
});

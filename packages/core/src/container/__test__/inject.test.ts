import { unit } from '../../module/ModuleBuilder';
import { inject } from '../inject';
import { container } from '../Container';
import { expectType, TypeEqual } from 'ts-expect';

describe(`inject`, () => {
  describe(`record`, () => {
    describe(`types`, () => {
      it(`returns object with correct types`, async () => {
        const m1 = unit()
          .define('a', () => 1)
          .define('b', () => 2)
          .build();

        const m2 = unit()
          .define('a', () => 10)
          .define('b', () => 20)
          .build();

        const slice = inject.record({
          a: inject.select(m1, 'a'),
          b: inject.select(m2, 'b'),
        });

        expectType<TypeEqual<ReturnType<typeof slice>, { a: number; b: number }>>(true);
      });
    });

    it(`builds function returning correct dependencies`, async () => {
      const m1 = unit()
        .define('a', () => 1)
        .define('b', () => 2)
        .build();

      const m2 = unit()
        .define('a', () => 10)
        .define('b', () => 20)
        .build();

      const slice = inject.record({
        a: inject.select(m1, 'a'),
        b: inject.select(m2, 'b'),
      });

      const c = container();
      const result = c.getSlice(slice);
      expect(result).toEqual({ a: 1, b: 20 });
    });
  });

  describe(`tuple`, () => {
    describe(`types`, () => {
      it(`returns object with correct types`, async () => {
        const m1 = unit()
          .define('a', () => 1)
          .define('b', () => '2')
          .build();

        const m2 = unit()
          .define('a', () => 10)
          .define('b', () => '20')
          .build();

        const slice = inject.tuple(inject.select(m1, 'a'), inject.select(m2, 'b'));

        expectType<TypeEqual<ReturnType<typeof slice>, [number, string]>>(true);
      });
    });

    it(`builds function returning correct dependencies`, async () => {
      const m1 = unit()
        .define('a', () => 1)
        .define('b', () => 2)
        .build();

      const m2 = unit()
        .define('a', () => 10)
        .define('b', () => 20)
        .build();

      const slice = inject.tuple(inject.select(m1, 'a'), inject.select(m2, 'b'));

      const c = container();
      const result = c.getSlice(slice);
      expect(result).toEqual([1, 20]);
    });
  });
});

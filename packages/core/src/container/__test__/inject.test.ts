import { inject } from '../../helpers/inject';
import { container } from '../Container';
import { expectType, TypeEqual } from 'ts-expect';
import { singleton, value } from '../../strategies/factory/strategies';

describe(`inject`, () => {
  describe(`record`, () => {
    describe(`types`, () => {
      it(`returns object with correct types`, async () => {
        const m1a = value(1);
        const m1b = value(2);

        const m2a = value(10);
        const m2b = value(20);

        const slice = inject.record({
          a: m1a,
          b: m2b,
        });

        expectType<TypeEqual<ReturnType<typeof slice>, { a: number; b: number }>>(true);
      });
    });

    it(`builds function returning correct dependencies`, async () => {
      const a = value(1);
      const b = value(20);

      const slice = inject.record({
        a,
        b,
      });

      const c = container();
      const result = c.select(slice);
      expect(result).toEqual({ a: 1, b: 20 });
    });

    it(`works with thunks`, async () => {
      const a = value(1);
      const b = value(20);
      const slice = inject.record({
        a: () => a,
        b: () => b,
      });

      const c = container();
      const result = c.select(slice);
      expect(result).toEqual({ a: 1, b: 20 });
    });
  });

  describe(`asyncRecord`, () => {
    it(`batches all async properties`, async () => {
      const p1 = singleton.fn(async () => 1);
      const p2 = singleton.fn(async () => 2);
      const val1 = singleton.fn(() => 10);

      const selector = inject.asyncRecord({
        a: p1,
        b: p2,
        c: val1,
      });

      const c = container();
      const selected = await c.select(selector);
      const expected: typeof selected = { a: 1, b: 2, c: 10 };

      expect(selected).toEqual(expected);
    });
  });
});

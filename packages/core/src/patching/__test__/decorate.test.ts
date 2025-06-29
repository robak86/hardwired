import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { singleton } from '../../definitions/tokens.js';

describe(`decorate`, () => {
  const someValue = singleton.token<number>('someValue');
  const someValueAsync = singleton.token<Promise<number>>('someValue');

  describe(`tokens`, () => {
    it(`decorates original value`, async () => {
      const c = container(c => {
        c.add(someValue).static(1);
        c.modify(someValue).decorate(val => val + 1);
      });

      expect(c.use(someValue)).toEqual(2);
    });

    it(`is evaluated with awaited value`, async () => {
      const c = container(c => {
        c.add(someValueAsync).fn(async () => 1);
        c.modify(someValueAsync).decorate(async val => val + 1);
      });

      expect(await c.use(someValueAsync)).toEqual(2);
    });

    it(`allows using additional dependencies, ex1`, async () => {
      const a = singleton.token<number>();
      const b = singleton.token<number>();

      const c = container(c => {
        c.add(a).static(1);
        c.add(b).static(2);
        c.add(someValueAsync).fn(async () => 10);

        c.modify(someValueAsync)
          .using(a, b)
          .decorate(async (val, aVal, bVal) => val + aVal + bVal);
      });

      expect(await c.use(someValueAsync)).toEqual(13);
    });
  });

  describe(`definitions`, () => {
    it(`decorates existing definition`, async () => {
      const a = singleton.fn(() => 1);
      const b = singleton.fn(() => 2);

      const c = container(c => {
        c.add(someValueAsync).fn(async () => 10);

        c.modify(a).decorate(val => 1000 + 1);
        c.modify(b).decorate(val => 1000 + 2);

        c.modify(someValueAsync)
          .using(a, b)
          .decorate(async (val, aVal, bVal) => val + aVal + bVal);
      });

      expect(await c.use(someValueAsync)).toEqual(1001 + 1002 + 10);
    });
  });
});

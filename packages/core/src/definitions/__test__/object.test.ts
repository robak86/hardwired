import { expectType } from 'ts-expect';
import { expect } from 'vitest';

import { fn } from '../fn.js';
import { object } from '../object.js';
import type { Definition } from '../impl/Definition.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import { once } from '../../container/Container.js';

describe(`object`, () => {
  describe(`types`, () => {
    describe(`async definition used`, () => {
      it(`returns async definition`, async () => {
        const sync = fn.singleton(() => 123);
        const asynchronous = fn(async () => 'str');
        const obj = object({ a: sync, b: asynchronous });

        expectType<Definition<Promise<{ a: number; b: string }>, LifeTime.transient, []>>(obj);
      });
    });

    describe(`only sync definitions`, () => {
      it(`returns sync definition`, async () => {
        const sync = fn.singleton(() => 123);
        const asynchronous = fn(() => 'str');
        const obj = object({ a: sync, b: asynchronous });

        expectType<Definition<{ a: number; b: string }, LifeTime.transient, []>>(obj);
      });
    });
  });

  describe(`resolution`, () => {
    it(`returns correct object`, async () => {
      const sync = fn.singleton(() => 123);
      const asynchronous = fn(async () => 'str');
      const obj = object({ a: sync, b: asynchronous });

      const result = await once(obj);

      expect(result).toEqual({ a: 123, b: 'str' });
    });
  });
});

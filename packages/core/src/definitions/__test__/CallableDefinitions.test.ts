import { expect } from 'vitest';

import type { IContainer } from '../../container/IContainer.js';
import { once } from '../../container/Container.js';
import { cls } from '../cls.js';
import { value } from '../value.js';
import { fn } from '../fn.js';

describe(`Callable`, () => {
  describe(`CallableObject`, () => {
    it(`forwards instance creation to the call method`, async () => {
      class MyCommandOrFactory {
        static instance = cls.transient(this);

        call(a: number, b: number) {
          return a + b;
        }
      }

      const result = once(MyCommandOrFactory.instance, 1, 2);

      expect(result).toEqual(3);
    });
  });

  describe(`CallableFn`, () => {
    it(`allows calling directly a function that takes container as this`, async () => {
      const multiplier = value(2);

      function multiply(this: IContainer, a: number) {
        return a * this.use(multiplier);
      }

      function callable(this: IContainer, a: number, b: number) {
        return this.call(multiply, a + b);
      }

      const result = once(callable, 1, 2);

      expect(result).toEqual(6);
    });

    it(`works with async functions`, async () => {
      const multiplier = value(2);

      async function multiply(this: IContainer, a: number) {
        return a * this.use(multiplier);
      }

      async function callable(this: IContainer, a: number, b: number) {
        return this.call(multiply, a + b);
      }

      const result = await once(callable, 1, 2);

      expect(result).toEqual(6);
    });
  });

  describe(`transient definition`, () => {
    it(`calls createFn`, async () => {
      const multiplier = value(2);

      const multiply = fn((use, a: number) => a * use(multiplier));
      const callable = fn((use, a: number, b: number) => use.call(multiply, a + b));

      const result = once(callable, 1, 2);

      expect(result).toEqual(6);
    });
  });
});

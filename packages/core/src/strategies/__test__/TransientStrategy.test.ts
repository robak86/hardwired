import { v4 } from 'uuid';
import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { fn } from '../../definitions/fn.js';
import { value } from '../../definitions/value.js';

describe(`ClassTransientResolver`, () => {
  describe(`sync resolution`, () => {
    class TestClass {
      public id = v4();

      constructor(public value: string) {}
    }

    const someValue = value('someString');

    const a = fn(use => {
      return new TestClass(use(someValue));
    });

    it(`returns class instance`, async () => {
      const c = container.new();

      expect(c.use(a)).toBeInstanceOf(TestClass);
    });

    it(`constructs class with correct dependencies`, async () => {
      const c = container.new();
      const instance = c.call(a);

      expect(instance.value).toEqual('someString');
    });

    it(`caches class instance`, async () => {
      const c = container.new();
      const instance = c.call(a);
      const instance2 = c.call(a);

      expect(instance).not.toBe(instance2);
    });
  });

  describe(`async resolution`, () => {
    class TestClass {
      public id = v4();

      constructor(public value: string) {}
    }

    const someValue = fn(async () => 'someString');
    const a = fn(async use => {
      return new TestClass(await use.call(someValue));
    });

    it(`returns class instance`, async () => {
      const c = container.new();

      expect(await c.call(a)).toBeInstanceOf(TestClass);
    });

    it(`constructs class with correct dependencies`, async () => {
      const c = container.new();
      const instance = await c.call(a);

      expect(instance.value).toEqual('someString');
    });

    it(`caches class instance`, async () => {
      const c = container.new();
      const instance = await c.call(a);
      const instance2 = await c.call(a);

      expect(instance).not.toBe(instance2);
    });
  });
});

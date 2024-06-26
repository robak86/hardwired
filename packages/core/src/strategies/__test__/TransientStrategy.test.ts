import { container } from '../../container/Container.js';
import { v4 } from 'uuid';
import { transient } from '../../definitions/definitions.js';
import { value } from '../../definitions/sync/value.js';
import { describe, it, expect, vi } from 'vitest';

describe(`ClassTransientResolver`, () => {
  describe(`sync resolution`, () => {
    class TestClass {
      public id = v4();

      constructor(public value: string) {}
    }

    const someValue = value('someString');
    const a = transient.using(someValue).class(TestClass);

    it(`returns class instance`, async () => {
      const c = container();
      expect(c.use(a)).toBeInstanceOf(TestClass);
    });

    it(`constructs class with correct dependencies`, async () => {
      const c = container();
      const instance = c.use(a);
      expect(instance.value).toEqual('someString');
    });

    it(`caches class instance`, async () => {
      const c = container();
      const instance = c.use(a);
      const instance2 = c.use(a);
      expect(instance).not.toBe(instance2);
    });
  });

  describe(`async resolution`, () => {
    class TestClass {
      public id = v4();

      constructor(public value: string) {}
    }

    const someValue = transient.async().fn(async () => 'someString');
    const a = transient.async().using(someValue).class(TestClass);

    it(`returns class instance`, async () => {
      const c = container();
      expect(await c.use(a)).toBeInstanceOf(TestClass);
    });

    it(`constructs class with correct dependencies`, async () => {
      const c = container();
      const instance = await c.use(a);
      expect(instance.value).toEqual('someString');
    });

    it(`caches class instance`, async () => {
      const c = container();
      const instance = await c.use(a);
      const instance2 = await c.use(a);
      expect(instance).not.toBe(instance2);
    });
  });
});

import { container } from '../../container/Container';
import { v4 } from 'uuid';
import { transient } from '../../definitions/definitions';
import { value } from '../../definitions/sync/value';
import { InstanceDefinition } from '../../definitions/abstract/base/InstanceDefinition';

describe(`ClassTransientResolver`, () => {
  describe(`sync resolution`, () => {
    class TestClass {
      public id = v4();

      constructor(public value: string) {}
    }

    const someValue = value('someString');
    const a = transient.class(TestClass, someValue);

    it(`returns class instance`, async () => {
      const c = container();
      expect(c.get(a)).toBeInstanceOf(TestClass);
    });

    it(`constructs class with correct dependencies`, async () => {
      const c = container();
      const instance = c.get(a);
      expect(instance.value).toEqual('someString');
    });

    it(`caches class instance`, async () => {
      const c = container();
      const instance = c.get(a);
      const instance2 = c.get(a);
      expect(instance).not.toBe(instance2);
    });
  });

  describe(`async resolution`, () => {
    class TestClass {
      public id = v4();

      constructor(public value: string) {}
    }

    const someValue = transient.asyncFn(async () => 'someString');
    const a = transient.asyncClass(TestClass, someValue);

    it(`returns class instance`, async () => {
      const c = container();
      expect(await c.getAsync(a)).toBeInstanceOf(TestClass);
    });

    it(`constructs class with correct dependencies`, async () => {
      const c = container();
      const instance = await c.getAsync(a);
      expect(instance.value).toEqual('someString');
    });

    it(`caches class instance`, async () => {
      const c = container();
      const instance = await c.getAsync(a);
      const instance2 = await c.getAsync(a);
      expect(instance).not.toBe(instance2);
    });
  });
});

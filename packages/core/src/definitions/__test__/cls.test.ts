import { expectType } from 'ts-expect';

import { cls } from '../cls.js';
import { fn } from '../fn.js';
import { container, once } from '../../container/Container.js';

describe(`cls`, () => {
  const num = fn(() => 123);
  const str = fn(() => '123');

  class MyClass {
    static asTransient = cls.transient(this, [num, str]);
    static asSingleton = cls.singleton(this, [num, str]);
    static asScoped = cls.scoped(this, () => [num, str]);

    readonly value = Math.random();

    constructor(
      public readonly a: number,
      public readonly b: string,
    ) {}
  }

  describe(`automatic awaiting of async dependencies`, () => {
    it(`returns async definition and creates class after awaiting all dependencies`, async () => {
      const asyncNum = fn(async () => 123);

      class MyClass {
        static instance = cls.singleton(this, [asyncNum]);
        constructor(readonly val: number) {}
      }

      const myClass = await once(MyClass.instance);

      expect(myClass.val).toBe(123);
    });

    describe(`multiple async and non-async dependencies`, () => {
      it(`correctly awaits all the dependencies`, async () => {
        const num = fn(() => 123);
        const str = fn(() => '123');

        const asyncNum = fn(async () => 123);
        const asyncStr = fn(async () => '123');

        class MyClass {
          static instance = cls.singleton(this, [asyncNum, asyncStr, num, str]);
          constructor(
            readonly numFromAsync: number,
            readonly strFromAsync: string,
            readonly num: number,
            readonly str: string,
          ) {}
        }

        class ParentClass {
          static instance = cls.singleton(this, [MyClass.instance]);
          constructor(readonly myClass: MyClass) {}
        }

        const c = await once(ParentClass.instance);

        expect(c.myClass.numFromAsync).toBe(123);
        expect(c.myClass.strFromAsync).toBe('123');
        expect(c.myClass.num).toBe(123);
        expect(c.myClass.str).toBe('123');
      });
    });

    describe(`types`, () => {
      it(`if some of the dependencies definitions are async the class definition becomes also async`, async () => {
        const asyncNum = fn(async () => 123);

        class MyClass {
          static instance = cls.scoped(this, [asyncNum]);
          constructor(readonly val: number) {}
        }

        expectType<Promise<MyClass>>(once(MyClass.instance));
      });
    });
  });

  describe(`types`, () => {
    it(`allows skipping args array`, async () => {
      class NoArgsClass {
        static class = cls.transient(this);
      }

      expect(once(NoArgsClass.class)).toBeInstanceOf(NoArgsClass);
    });

    it(`requires args argument in class constructor requires arguments`, async () => {
      // @ts-ignore
      class _WithArgsClass {
        // @ts-expect-error - missing args
        static class = cls.transient(this);

        // @ts-ignore
        constructor(private _a: number) {}
      }
    });

    it(`enforces correct scopes`, async () => {
      class DependencyClass {
        static instance = cls.scoped(this);
      }

      // @ts-ignore
      class _InvalidScopeClass {
        // @ts-expect-error - DependencyClass.instance has invalid scope
        static class = cls.singleton(this, [DependencyClass.instance]);

        constructor(_a: DependencyClass) {}
      }
    });
  });

  describe(`checking for undefined`, () => {
    it(`throws when some of the dependencies are undefined`, async () => {
      class MyClass {}

      expect(() => {
        // @ts-ignore
        cls.transient(MyClass, [undefined as any]);
      }).toThrowError();

      expect(() => {
        // @ts-ignore
        cls.scoped(MyClass, [undefined as any]);
      }).toThrowError();

      expect(() => {
        // @ts-ignore
        cls.singleton(MyClass, [undefined as any]);
      }).toThrowError();
    });
  });

  describe(`transient`, () => {
    it(`creates correct instance providing correct args`, async () => {
      const cnt = container.new();

      const instance1 = cnt.use(MyClass.asTransient);
      const instance2 = cnt.use(MyClass.asTransient);

      expect(instance1).not.toBe(instance2);
    });
  });

  describe(`singleton`, () => {
    it(`creates correct instance providing correct args`, async () => {
      const cnt = container.new();

      const instance1 = cnt(MyClass.asSingleton);
      const instance2 = cnt(MyClass.asSingleton);

      expect(instance1).toBe(instance2);
    });
  });

  describe(`scoped`, () => {
    it(`creates correct instance providing correct args`, async () => {
      const cnt = container.new();

      const instance1 = cnt(MyClass.asScoped);
      const instance2 = cnt(MyClass.asScoped);
      const instance3 = cnt.scope().use(MyClass.asScoped);

      expect(instance1).toBe(instance2);
      expect(instance1).not.toBe(instance3);
    });
  });
});

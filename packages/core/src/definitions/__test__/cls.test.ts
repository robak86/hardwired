import { cls } from '../cls.js';
import { fn } from '../definitions.js';
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

  describe(`types`, () => {
    it(`allows skipping args array`, async () => {
      class NoArgsClass {
        static instance = cls.transient(this);
      }

      expect(once(NoArgsClass.instance)).toBeInstanceOf(NoArgsClass);
    });

    it(`requires args argument in class constructor requires arguments`, async () => {
      // @ts-ignore
      class WithArgsClass {
        // @ts-expect-error - missing args
        static instance = cls.transient(this);

        // @ts-ignore
        constructor(private _a: number) {}
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
      const instance3 = cnt.checkoutScope().use(MyClass.asScoped);

      expect(instance1).toBe(instance2);
      expect(instance1).not.toBe(instance3);
    });
  });
});

import { cls } from '../cls.js';
import { fn } from '../definitions.js';
import { container, once } from '../../container/Container.js';

describe(`cls`, () => {
  const num = fn(() => 123);
  const str = fn(() => '123');

  class MyClass {
    static asTransient = cls.transient(this, [num, str]);
    static asSingleton = cls.singleton(this, [num, str]);
    static asScoped = cls.scoped(this, [num, str]);

    readonly value = Math.random();

    constructor(
      public readonly a: number,
      public readonly b: string,
    ) {}
  }

  describe(`transient`, () => {
    it(`creates correct instance providing correct args`, async () => {
      const instance1 = once(MyClass.asTransient);
      const instance2 = once(MyClass.asTransient);

      expect(instance1).not.toBe(instance2);
    });
  });

  describe(`singleton`, () => {
    it(`creates correct instance providing correct args`, async () => {
      const instance1 = once(MyClass.asSingleton);
      const instance2 = once(MyClass.asSingleton);

      expect(instance1).toBe(instance2);
    });
  });

  describe(`scoped`, () => {
    it(`creates correct instance providing correct args`, async () => {
      const instance1 = once(MyClass.asScoped);
      const instance2 = once(MyClass.asScoped);
      const instance3 = container.checkoutScope().use(MyClass.asScoped);

      expect(instance1).toBe(instance2);
      expect(instance1).not.toBe(instance3);
    });
  });
});

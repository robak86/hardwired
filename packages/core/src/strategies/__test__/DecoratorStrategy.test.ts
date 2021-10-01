import { module, moduleNew } from '../../module/ModuleBuilder';

import { singletonFn, value } from '../../new/classStrategies';
import { decorate, set } from '../../new/instancePatching';
import { container } from '../../container/Container';
import { request, scoped, singleton, transient } from '../../new/singletonStrategies';
import { InstanceEntry } from '../../new/InstanceEntry';

describe(`DecoratorStrategy`, () => {
  it(`decorates original value`, async () => {
    const m = module().__define('someValue', value(1)).compile();

    const c = container({ scopeOverridesNew: [decorate(m.someValue, val => val + 1)] });
    expect(c.__get(m.someValue)).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const m = module().__define('someValue', value(1)).build();

    const mPatch = decorate(m.someValue, val => val + 1);

    expect(container().__get(m.someValue)).toEqual(1);
    expect(container({ scopeOverridesNew: [mPatch] }).__get(m.someValue)).toEqual(2);
  });

  it(`allows for multiple decorations`, async () => {
    const m = module().__define('someValue', value(1)).build();

    const mPatch = decorate(
      decorate(m.someValue, val => val + 1),
      val => val * 3,
    );

    const c = container({ scopeOverridesNew: [mPatch] });
    expect(c.__get(m.someValue)).toEqual(6);
  });

  it(`allows using other dependencies from the same module, ex1`, async () => {
    const m = module() //
      .__define('a', value(1))
      .__define('b', value(2))
      .__define('someValue', value(10))
      .build();

    const mPatch = decorate(m.someValue, (val, a: number, b: number) => val + a + b, [m.a, m.b]);

    const c = container({ scopeOverridesNew: [mPatch] });
    expect(c.__get(m.someValue)).toEqual(13);
  });

  it(`allows using other dependencies from the same module, ex2`, async () => {
    const m = moduleNew(() => {
      const a = value(1);
      const b = value(2);
      const someValue = singletonFn((a, b) => a + b, [a, b]);

      return {
        a,
        b,
        someValue,
      };
    });

    const mPatch = decorate(m.someValue, (val, b) => val * b, [m.b]);

    const c = container({ scopeOverridesNew: [mPatch] });
    expect(c.__get(m.someValue)).toEqual(6);
  });

  describe(`scopeOverrides`, () => {
    // TODO
    it(`preserves singleton scope of the original resolver`, async () => {
      const m = module()
        .__define(
          'a',
          singleton.fn(() => Math.random()),
        )
        .build();

      // const mPatch = m.decorate('a', a => a);
      const mPatch = decorate(m.a, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      expect(c.__get(m.a)).toEqual(c.__get(m.a));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const m = module()
        .__define(
          'a',
          transient.fn(() => Math.random()),
        )
        .build();

      const mPatch = decorate(m.a, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      expect(c.__get(m.a)).not.toEqual(c.__get(m.a));
    });

    it(`uses different request scope for each subsequent asObject call`, async () => {
      // const m = module()
      //   .__define('source', request.fn(() => Math.random()))
      //   .__define('a', request.fn({ source }) => source)
      //   .build();

      const m = moduleNew(() => {
        const source = request.fn(() => Math.random());
        const a = request.fn(source => source, [source]);
        return { a, source };
      });

      const mPatch = decorate(m.a, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      const req1 = c.__asObject(m);
      const req2 = c.__asObject(m);

      expect(req1.source).toEqual(req1.a);
      expect(req2.source).toEqual(req2.a);
      expect(req1.source).not.toEqual(req2.source);
      expect(req1.a).not.toEqual(req2.a);
    });

    it(`does not cache produced object`, async () => {
      const m = module()
        .__define(
          'a',
          request.fn(() => Math.random()),
        )
        .__define(
          'b',
          request.fn(() => Math.random()),
        )
        .build();

      const c = container();
      const obj1 = c.asObject(m);
      const obj2 = c.asObject(m);

      expect(obj1).not.toBe(obj2);
    });
  });

  describe(`globalOverrides`, () => {
    function setup(instanceDef: InstanceEntry<MyService>) {
      const m = module().__define('a', instanceDef).build();

      const mPatch = decorate(m.a, a => {
        jest.spyOn(a, 'callMe');
        return a;
      });

      const replaced = set(m.a, { callMe: () => {} });

      const scope1 = container({ globalOverridesNew: [mPatch] });
      const scope2 = scope1.checkoutScope({ scopeOverridesNew: [replaced] });
      const instance1 = scope1.__get(m.a);
      const instance2 = scope2.__get(m.a);
      return { instance1, instance2 };
    }

    class MyService {
      callMe(...args: any[]) {}
    }

    describe(`apply on singleton definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(singleton.class(MyService));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on scoped definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(scoped.class(MyService));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on transients definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(transient.class(MyService));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on request definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(request.class(MyService));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });
  });
});

import { singletonFn, value } from '../../new/classStrategies';
import { decorate, set } from '../../new/instancePatching';
import { container } from '../../container/Container';
import { request, scoped, singleton, transient } from '../../new/singletonStrategies';
import { InstanceEntry } from '../../new/InstanceEntry';

describe(`DecoratorStrategy`, () => {
  it(`decorates original value`, async () => {
    const someValue = value(1);

    const c = container({ scopeOverridesNew: [decorate(someValue, val => val + 1)] });
    expect(c.__get(someValue)).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const someValue = value(1);
    const mPatch = decorate(someValue, val => val + 1);

    expect(container().__get(someValue)).toEqual(1);
    expect(container({ scopeOverridesNew: [mPatch] }).__get(someValue)).toEqual(2);
  });

  it(`allows for multiple decorations`, async () => {
    const someValue = value(1);
    const mPatch = decorate(
      decorate(someValue, val => val + 1),
      val => val * 3,
    );

    const c = container({ scopeOverridesNew: [mPatch] });
    expect(c.__get(someValue)).toEqual(6);
  });

  it(`allows using other dependencies from the same module, ex1`, async () => {
    const a = value(1);
    const b = value(2);
    const someValue = value(10);

    const mPatch = decorate(someValue, (val, a: number, b: number) => val + a + b, [a, b]);

    const c = container({ scopeOverridesNew: [mPatch] });
    expect(c.__get(someValue)).toEqual(13);
  });

  it(`allows using other dependencies from the same module, ex2`, async () => {
    const a = value(1);
    const b = value(2);
    const someValue = singletonFn((a, b) => a + b, [a, b]);

    const mPatch = decorate(someValue, (val, b) => val * b, [b]);

    const c = container({ scopeOverridesNew: [mPatch] });
    expect(c.__get(someValue)).toEqual(6);
  });

  describe(`scopeOverrides`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const a = singleton.fn(() => Math.random());
      const mPatch = decorate(a, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      expect(c.__get(a)).toEqual(c.__get(a));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const a = transient.fn(() => Math.random());

      const mPatch = decorate(a, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      expect(c.__get(a)).not.toEqual(c.__get(a));
    });

    it(`uses different request scope for each subsequent asObject call`, async () => {
      const source = request.fn(() => Math.random());
      const a = request.fn(source => source, [source]);

      const mPatch = decorate(a, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      const req1 = c.__asObject({ source, a });
      const req2 = c.__asObject({ source, a });

      expect(req1.source).toEqual(req1.a);
      expect(req2.source).toEqual(req2.a);
      expect(req1.source).not.toEqual(req2.source);
      expect(req1.a).not.toEqual(req2.a);
    });

    it(`does not cache produced object`, async () => {
      const a = request.fn(() => Math.random());
      const b = request.fn(() => Math.random());

      const c = container();
      const obj1 = c.__asObject({ a, b });
      const obj2 = c.__asObject({ a, b });

      expect(obj1).not.toBe(obj2);
    });
  });

  describe(`globalOverrides`, () => {
    function setup(instanceDef: InstanceEntry<MyService>) {
      const mPatch = decorate(instanceDef, a => {
        jest.spyOn(a, 'callMe');
        return a;
      });

      const replaced = set(instanceDef, { callMe: () => {} });

      const scope1 = container({ globalOverridesNew: [mPatch] });
      const scope2 = scope1.checkoutScope({ scopeOverridesNew: [replaced] });
      const instance1 = scope1.__get(instanceDef);
      const instance2 = scope2.__get(instanceDef);
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

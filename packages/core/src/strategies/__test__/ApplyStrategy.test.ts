import { container } from '../../container/Container';
import { BoxedValue } from '../../__test__/BoxedValue';
import { request, scoped, singleton, transient } from '../factory/strategies';
import { apply, decorate, set } from '../../new/instancePatching';
import { InstanceDefinition } from '../../new/InstanceDefinition';

describe(`ApplyResolver`, () => {
  it(`applies function to original value`, async () => {
    const someValue = singleton.fn(() => new BoxedValue(1));

    const mPatch = apply(someValue, val => (val.value += 1));

    const c = container({ scopeOverridesNew: [mPatch] });
    expect(c.get(someValue).value).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const someValue = singleton.fn(() => new BoxedValue(1));

    const mPatch = apply(someValue, val => (val.value += 1));

    expect(container().get(someValue).value).toEqual(1);
    expect(container({ scopeOverridesNew: [mPatch] }).get(someValue).value).toEqual(2);
  });

  it(`allows for multiple apply functions calls`, async () => {
    const someValue = singleton.fn(() => new BoxedValue(1));

    const mPatch = apply(
      apply(someValue, val => (val.value += 1)),
      val => (val.value *= 3),
    );

    const c = container({ scopeOverridesNew: [mPatch] });
    expect(c.get(someValue).value).toEqual(6);
  });

  describe(`scopeOverrides`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const someValue = singleton.fn(() => Math.random());
      const mPatch = apply(someValue, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      expect(c.get(someValue)).toEqual(c.get(someValue));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const someValue = transient.fn(() => Math.random());

      const mPatch = apply(someValue, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      expect(c.get(someValue)).not.toEqual(c.get(someValue));
    });

    it(`preserves request scope of the original resolver`, async () => {
      const source = request.fn(() => Math.random());
      const a = request.fn(source => source, [source]);

      const mPatch = apply(a, a => a);

      const c = container({ scopeOverridesNew: [mPatch] });
      const req1 = c.asObject({ a, source });
      const req2 = c.asObject({ a, source });

      expect(req1.source).toEqual(req1.a);
      expect(req2.source).toEqual(req2.a);
      expect(req1.source).not.toEqual(req2.source);
      expect(req1.a).not.toEqual(req2.a);
    });

    // TODO: wrong test assertion
    it.skip(`does not change original strategy`, async () => {
      // const m = module()
      //   .__define(
      //     'a',
      //     request.fn(() => Math.random()),
      //   )
      //   .__define(
      //     'b',
      //     request.fn(() => Math.random()),
      //   )
      //   .build();
      //
      // const c = container();
      // const obj1 = c.__asObject(m);
      // const obj2 = c.__asObject(m);
      //
      // expect(obj1).not.toBe(obj2);
    });
  });

  describe(`globalOverrides`, () => {
    function setup(instanceDef: InstanceDefinition<MyService>) {
      const mPatch = decorate(instanceDef, a => {
        jest.spyOn(a, 'callMe');
        return a;
      });

      const replaced = set(instanceDef, { callMe: () => {} });

      const scope1 = container({ globalOverridesNew: [mPatch] });
      const scope2 = scope1.checkoutScope({ scopeOverridesNew: [replaced] });
      const instance1 = scope1.get(instanceDef);
      const instance2 = scope2.get(instanceDef);
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

import { container } from '../../container/Container.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { request, scoped, singleton, transient } from '../../definitions/definitions.js';
import { set } from '../set.js';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';
import { decorate } from '../decorate.js';
import { apply } from '../apply.js';
import { object } from '../../definitions/sync/object.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { value } from '../../definitions/sync/value.js';
import { describe, it, expect, vi } from 'vitest';

describe(`apply`, () => {
  it(`applies function to original value`, async () => {
    const someValue = singleton.fn(() => new BoxedValue(1));

    const mPatch = apply(someValue, val => (val.value += 1));

    const c = container({ scopeOverrides: [mPatch] });
    expect(c.get(someValue).value).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const someValue = singleton.fn(() => new BoxedValue(1));

    const mPatch = apply(someValue, val => (val.value += 1));

    expect(container().get(someValue).value).toEqual(1);
    expect(container({ scopeOverrides: [mPatch] }).get(someValue).value).toEqual(2);
  });

  it(`allows for multiple apply functions calls`, async () => {
    const someValue = singleton.fn(() => new BoxedValue(1));

    const mPatch = apply(
      apply(someValue, val => (val.value += 1)),
      val => (val.value *= 3),
    );

    const c = container({ scopeOverrides: [mPatch] });
    expect(c.get(someValue).value).toEqual(6);
  });

  it(`allows using additional dependencies, ex1`, async () => {
    const a = value(new BoxedValue(1));
    const b = value(new BoxedValue(2));
    const someValue = value(new BoxedValue(10));

    const mPatch = apply(
      someValue,
      (val, a, b) => {
        val.value = val.value + a.value + b.value;
      },
      a,
      b,
    );

    const c = container({ scopeOverrides: [mPatch] });
    expect(c.get(someValue)).toEqual(new BoxedValue(13));
  });

  it(`allows using additional dependencies, ex2`, async () => {
    const a = value(new BoxedValue(1));
    const b = value(new BoxedValue(2));
    const someValue = singleton.fn(
      (a: BoxedValue<number>, b: BoxedValue<number>) => {
        return new BoxedValue(a.value + b.value);
      },
      a,
      b,
    );

    const mPatch = apply(
      someValue,
      (val, b) => {
        val.value = val.value * b.value;
      },
      b,
    );

    const c = container({ scopeOverrides: [mPatch] });
    expect(c.get(someValue)).toEqual(new BoxedValue(6));
  });

  describe(`scopeOverrides`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const someValue = singleton.fn(() => Math.random());
      const mPatch = apply(someValue, a => a);

      const c = container({ scopeOverrides: [mPatch] });
      expect(c.get(someValue)).toEqual(c.get(someValue));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const someValue = transient.fn(() => Math.random());

      const mPatch = apply(someValue, a => a);

      const c = container({ scopeOverrides: [mPatch] });
      expect(c.get(someValue)).not.toEqual(c.get(someValue));
    });

    it(`preserves request scope of the original resolver`, async () => {
      const source = request.fn(() => Math.random());
      const a = request.fn(source => source, source);

      const mPatch = apply(a, a => a);

      const c = container({ scopeOverrides: [mPatch] });
      const req1 = c.get(object({ a, source }));
      const req2 = c.get(object({ a, source }));

      expect(req1.source).toEqual(req1.a);
      expect(req2.source).toEqual(req2.a);
      expect(req1.source).not.toEqual(req2.source);
      expect(req1.a).not.toEqual(req2.a);
    });
  });

  describe(`globalOverrides`, () => {
    function setup(instanceDef: InstanceDefinition<MyService, any, never>) {
      const mPatch = decorate(instanceDef, a => {
        vi.spyOn(a, 'callMe');
        return a;
      });

      const replaced = set(instanceDef, { callMe: () => {} });

      const scope1 = ContainerContext.create([], [mPatch]);
      const scope2 = scope1.checkoutScope({ scopeOverrides: [replaced] });
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

import { set } from '../set.js';
import { container } from '../../container/Container.js';
import { scoped, singleton, transient } from '../../definitions/definitions.js';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';
import { decorate } from '../decorate.js';
import { object } from '../../definitions/sync/object.js';
import { value } from '../../definitions/sync/value.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { describe, it, expect, vi } from 'vitest';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';

describe(`decorate`, () => {
  it(`decorates original value`, async () => {
    const someValue = value(1);

    const c = container({ overrides: [decorate(someValue, val => val + 1)] });
    expect(c.get(someValue)).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const someValue = value(1);
    const mPatch = decorate(someValue, val => val + 1);

    expect(container().get(someValue)).toEqual(1);
    expect(container({ overrides: [mPatch] }).get(someValue)).toEqual(2);
  });

  it(`allows for multiple decorations`, async () => {
    const someValue = value(1);
    const mPatch = decorate(
      decorate(someValue, val => val + 1),
      val => val * 3,
    );

    const c = container({ overrides: [mPatch] });
    expect(c.get(someValue)).toEqual(6);
  });

  it(`allows using additional dependencies, ex1`, async () => {
    const a = value(1);
    const b = value(2);
    const someValue = value(10);

    const mPatch = decorate(someValue, (val, a: number, b: number) => val + a + b, a, b);

    const c = container({ overrides: [mPatch] });
    expect(c.get(someValue)).toEqual(13);
  });

  it(`allows using additional dependencies, ex2`, async () => {
    const a = value(1);
    const b = value(2);
    const someValue = singleton.using(a, b).fn((a: number, b: number) => a + b);

    const mPatch = decorate(someValue, (val, b) => val * b, b);

    const c = container({ overrides: [mPatch] });
    expect(c.get(someValue)).toEqual(6);
  });

  describe(`scopeOverrides`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const a = singleton.fn(() => Math.random());
      const mPatch = decorate(a, a => a);

      const c = container({ overrides: [mPatch] });
      expect(c.get(a)).toEqual(c.get(a));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const a = transient.fn(() => Math.random());

      const mPatch = decorate(a, a => a);

      const c = container({ overrides: [mPatch] });
      expect(c.get(a)).not.toEqual(c.get(a));
    });

    it(`uses correct scope`, async () => {
      const source = scoped.fn(() => Math.random());
      const a = scoped.using(source).fn((source: number) => source);

      const mPatch = decorate(a, a => a);

      const c = container({ overrides: [mPatch] });
      const obj1 = object({ source, a });

      const req1 = c.get(obj1);
      const req2 = c.get(obj1);

      expect(obj1.strategy).toEqual(LifeTime.scoped);
      expect(req1).toBe(req2);
    });

    it(`caches produced object`, async () => {
      const a = scoped.fn(() => Math.random());

      const c = container();
      const obj1 = c.get(a);
      const obj2 = c.get(a);

      expect(obj1).toBe(obj2);
    });
  });

  describe(`globalOverrides`, () => {
    function setup(instanceDef: InstanceDefinition<MyService, any>) {
      const mPatch = decorate(instanceDef, a => {
        vi.spyOn(a, 'callMe');
        return a;
      });

      const replaced = set(instanceDef, { callMe: () => {} });

      const scope1 = ContainerContext.create([], [mPatch]);
      const scope2 = scope1.checkoutScope({ overrides: [replaced] });
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
        const { instance1, instance2 } = setup(scoped.class(MyService));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });
  });
});

import { container } from '../../container/Container.js';
import { fn } from '../../definitions/definitions.js';

import { value } from '../../definitions/sync/value.js';
import { describe, expect, it, vi } from 'vitest';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';

import { BaseDefinition } from '../../definitions/abstract/BaseDefinition.js';

describe(`decorate`, () => {
  it(`decorates original value`, async () => {
    const someValue = value(1);

    const c = container.new({ scope: [someValue.decorateWith((use, val) => val + 1)] });

    expect(c.use(someValue)).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const someValue = value(1);

    const mPatch = someValue.decorateWith((use, val) => {
      return val + 1;
    });

    expect(container.new().use(someValue)).toEqual(1);
    expect(container.new({ scope: [mPatch] }).use(someValue)).toEqual(2);
  });

  it(`allows for multiple decorations`, async () => {
    const someValue = value(1);

    const mPatch = someValue
      .decorateWith((use, val) => {
        return val + 1;
      })
      .decorateWith((use, val) => {
        return val * 3;
      });
    const c = container.new({ scope: [mPatch] });
    expect(c.use(someValue)).toEqual(6);
  });

  it(`allows using additional dependencies, ex1`, async () => {
    const a = value(1);
    const b = value(2);
    const someValue = value(10);

    const mPatch = someValue.decorateWith((use, val) => {
      return val + use(a) + use(b);
    });

    const c = container.new({ scope: [mPatch] });
    expect(c.use(someValue)).toEqual(13);
  });

  it(`allows using additional dependencies, ex2`, async () => {
    const a = value(1);
    const b = value(2);

    const someValue = fn.singleton(use => {
      return use(a) + use(b);
    });

    const mPatch = someValue.decorateWith((use, val) => {
      return val * use(b);
    });

    const c = container.new({ scope: [mPatch] });
    expect(c.use(someValue)).toEqual(6);
  });

  describe(`scopeOverrides`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const a = fn.singleton(() => Math.random());

      const mPatch = a.decorateWith((use, a) => a);

      const c = container.new({ scope: [mPatch] });
      expect(c.use(a)).toEqual(c.use(a));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const a = fn(() => Math.random());

      const mPatch = a.decorateWith((use, a) => a);

      const c = container.new({ scope: [mPatch] });
      expect(c.use(a)).not.toEqual(c.use(a));
    });

    it(`uses correct scope`, async () => {
      const source = fn.scoped(() => Math.random());

      const a = fn.scoped(use => {
        return use(source);
      });

      const mPatch = a.decorateWith((use, a) => a);

      const c = container.new({ scope: [mPatch] });
      const obj1 = fn.scoped(use => ({
        a: use(a),
        source: use(source),
      }));

      const req1 = c.use(obj1);
      const req2 = c.use(obj1);

      expect(obj1.strategy).toEqual(LifeTime.scoped);
      expect(req1).toBe(req2);
    });

    it(`caches produced object`, async () => {
      const a = fn.scoped(() => Math.random());

      const c = container.new();
      const obj1 = c.use(a);
      const obj2 = c.use(a);

      expect(obj1).toBe(obj2);
    });
  });

  describe(`globalOverrides`, () => {
    function setup(instanceDef: BaseDefinition<MyService, any, any>) {
      const mPatch = instanceDef.decorateWith((use, a) => {
        vi.spyOn(a, 'callMe');
        return a;
      });

      const replaced = instanceDef.bindValue({ callMe: () => {} });

      const scope1 = container.new({ final: [mPatch] });
      const scope2 = scope1.checkoutScope({ scope: [replaced] });
      const instance1 = scope1.use(instanceDef);
      const instance2 = scope2.use(instanceDef);
      return { instance1, instance2 };
    }

    class MyService {
      callMe(...args: any[]) {}
    }

    describe(`apply on singleton definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(fn.singleton(use => new MyService()));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on scoped definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(fn.scoped(() => new MyService()));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on transients definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(fn(() => new MyService()));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on request definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(fn.scoped(() => new MyService()));
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });
  });
});

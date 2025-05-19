import { describe, expect, it, vi } from 'vitest';

import { container } from '../../container/Container.js';
import { fn } from '../../definitions/fn.js';
import { value } from '../../definitions/value.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { Definition } from '../../definitions/impl/Definition.js';
import type { ScopeConfigureAllowedLifeTimes } from '../../configuration/abstract/ScopeConfigurable.js';

describe(`decorate`, () => {
  it(`decorates original value`, async () => {
    const someValue = value(1);

    const c = container.new(c => {
      c.override(someValue).toDecorated(val => val + 1);
    });

    expect(c.use(someValue)).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const someValue = value(1);

    expect(container.new().use(someValue)).toEqual(1);

    const cnt = container.new(c => {
      c.override(someValue).toDecorated(val => val + 1);
    });

    expect(cnt.use(someValue)).toEqual(2);
  });

  it(`calls decorate function with awaited instance in case of async definitions`, async () => {
    const someValue = fn(async () => 1);

    const c = container.new(c => {
      c.override(someValue).toDecorated(val => val + 1);
    });

    expect(await c.call(someValue)).toEqual(2);
  });

  it(`allows using async decorate Fn for async definitions`, async () => {
    const someValue = fn(async () => 1);

    const c = container.new(c => {
      c.override(someValue).toDecorated(async val => val + 1);
    });

    expect(await c.call(someValue)).toEqual(2);
  });

  it(`does not allow async decorate functions for sync definitions`, async () => {
    const someValue = value(1);

    const c = container.new(c => {
      //@ts-expect-error - cannot return Promise<number> for number (due to async function)
      c.bind(someValue).toDecorated(async val => val + 1);
    });

    expect(() => c.use(someValue)).toThrowError();
  });

  it(`allows using additional dependencies, ex1`, async () => {
    const a = value(1);
    const b = value(2);
    const someValue = value(10);

    const c = container.new(c => {
      c.override(someValue).toDecorated((val, use) => {
        const aVal = use(a);
        const bVal = use(b);

        return val + aVal + bVal;
      });
    });

    expect(c.use(someValue)).toEqual(13);
  });

  it(`allows using additional dependencies, ex2`, async () => {
    const a = value(1);
    const b = value(2);

    const someValue = fn.scoped(use => {
      return use(a) + use(b);
    });

    const c = container.new(c => {
      c.override(someValue).toDecorated((val, use) => {
        return val * use(b);
      });
    });

    expect(c.use(someValue)).toEqual(6);
  });

  describe(`scopeOverrides`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const a = fn.scoped(() => Math.random());

      const c = container.new(c => {
        c.override(a).toDecorated(a => a);
      });

      expect(c.use(a)).toEqual(c.use(a));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const a = fn(() => Math.random());

      const c = container.new(c => {
        c.override(a).toDecorated(a => a);
      });

      expect(c.call(a)).not.toEqual(c.call(a));
    });

    it(`uses correct scope`, async () => {
      const source = fn.scoped(() => Math.random());

      const a = fn.scoped(use => {
        return use(source);
      });

      const c = container.new(c => {
        c.override(a).toDecorated(a => a);
      });

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
    function setup(instanceDef: Definition<MyService, ScopeConfigureAllowedLifeTimes, []>) {
      const scope1 = container.new(c => {
        c.freeze(instanceDef).toConfigured(a => {
          vi.spyOn(a, 'callMe');
        });
      });

      const scope2 = scope1.scope(scope => {
        scope.override(instanceDef).toValue({ callMe: () => {} });
      });

      const instance1 = scope1.use(instanceDef);
      const instance2 = scope2.use(instanceDef);

      return { instance1, instance2 };
    }

    class MyService {
      callMe(..._args: any[]) {}
    }

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

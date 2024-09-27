import { container } from '../../container/Container.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { fn } from '../../definitions/definitions.js';

import { value } from '../../definitions/sync/value.js';
import { describe, expect, it, vi } from 'vitest';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';

import { Definition } from '../../definitions/abstract/Definition.js';
import { configureContainer } from '../../container/ContainerConfiguration.js';

describe(`apply`, () => {
  it(`applies function to original value`, async () => {
    const someValue = fn.singleton(() => new BoxedValue(1));

    const config = configureContainer(c => {
      c.bind(someValue).toConfigured((_, val) => (val.value += 1));
    });

    const c = container.new(config);

    expect(c.use(someValue).value).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const someValue = fn.singleton(() => new BoxedValue(1));

    expect(container.new().use(someValue).value).toEqual(1);

    const cnt = container.new(c => {
      c.bind(someValue).toConfigured((_, val) => (val.value += 1));
    });
    expect(cnt.use(someValue).value).toEqual(2);
  });

  it(`throws for multiple bind for the same definition`, async () => {
    const someValue = fn.singleton(() => new BoxedValue(1));

    expect(() => {
      container.new(c => {
        c.bind(someValue).toConfigured((_, val) => (val.value += 1));
        c.bind(someValue).toConfigured((_, val) => (val.value *= 3));
      });
    }).toThrowError();
  });

  it(`allows using additional dependencies, ex1`, async () => {
    const a = value(new BoxedValue(1));
    const b = value(new BoxedValue(2));
    const someValue = value(new BoxedValue(10));

    const c = container.new(c => {
      c.bind(someValue).toConfigured((use, val) => {
        const aVal = use(a);
        const bVal = use(b);
        val.value = val.value + aVal.value + bVal.value;
      });
    });

    expect(c.use(someValue)).toEqual(new BoxedValue(13));
  });

  it(`allows using additional dependencies, ex2`, async () => {
    const a = value(new BoxedValue(1));
    const b = value(new BoxedValue(2));

    const someValue = fn.singleton(use => {
      return new BoxedValue(use(a).value + use(b).value);
    });

    const c = container.new(c => {
      c.bind(someValue).toConfigured((use, val) => {
        val.value = val.value * use(b).value;
      });
    });

    expect(c.use(someValue)).toEqual(new BoxedValue(6));
  });

  describe(`scopeOverrides`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const someValue = fn.singleton(() => Math.random());

      const c = container.new(c => {
        c.bind(someValue).toConfigured((use, a) => a);
      });

      expect(c.use(someValue)).toEqual(c.use(someValue));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const someValue = fn(() => Math.random());

      const c = container.new(c => {
        c.bind(someValue).toConfigured((use, a) => a);
      });

      expect(c.use(someValue)).not.toEqual(c.use(someValue));
    });

    it(`preserves scope of the original resolver`, async () => {
      const source = fn.scoped(() => Math.random());
      const a = fn.scoped(use => {
        return use(source);
      });

      const c = container.new(c => {
        c.bind(a).toConfigured((use, a) => a);
      });

      const objDef = fn.scoped(use => ({
        a: use(a),
        source: use(source),
      }));

      expect(objDef.strategy).toEqual(LifeTime.scoped);

      const req1 = c.use(objDef);
      const req2 = c.use(objDef);

      expect(req1).toEqual(req2);
    });
  });

  describe(`globalOverrides`, () => {
    function setup(instanceDef: Definition<MyService, LifeTime.scoped | LifeTime.transient, any>) {
      const scope1 = container.new(c => {
        c.freeze(instanceDef).toConfigured((use, a) => {
          vi.spyOn(a, 'callMe');
          return a;
        });
      });

      const scope2 = scope1.checkoutScope(scope => {
        scope.bind(instanceDef).toValue({ callMe: () => {} });
      });

      const instance1 = scope1.use(instanceDef);
      const instance2 = scope2.use(instanceDef);
      return { instance1, instance2 };
    }

    class MyService {
      callMe(...args: any[]) {}
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
  });
});

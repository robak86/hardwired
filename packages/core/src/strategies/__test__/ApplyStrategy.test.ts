import { module } from '../../module/ModuleBuilder';
import { singleton, SingletonStrategyLegacy } from '../SingletonStrategyLegacy';
import { container } from '../../container/Container';
import { transient } from '../TransientStrategyLegacy';
import { request } from '../RequestStrategyLegacy';
import { BoxedValue } from '../../__test__/BoxedValue';
import { scoped } from '../ScopeStrategy';
import { BuildStrategy } from '../abstract/BuildStrategy';

describe(`ApplyResolver`, () => {
  it(`applies function to original value`, async () => {
    const m = module()
      .define('someValue', singleton, () => new BoxedValue(1))
      .build();

    const mPatch = m.apply('someValue', val => (val.value += 1));

    const c = container({ scopeOverrides: [mPatch] });
    expect(c.get(m, 'someValue').value).toEqual(2);
  });

  it(`does not affect original module`, async () => {
    const m = module()
      .define('someValue', singleton, () => new BoxedValue(1))
      .build();

    const mPatch = m.apply('someValue', val => (val.value += 1));

    expect(container().get(m, 'someValue').value).toEqual(1);
    expect(container({ scopeOverrides: [mPatch] }).get(m, 'someValue').value).toEqual(2);
  });

  it(`allows for multiple apply functions calls`, async () => {
    const m = module()
      .define('someValue', singleton, () => new BoxedValue(1))
      .build();

    const mPatch = m.apply('someValue', val => (val.value += 1)).apply('someValue', val => (val.value *= 3));

    const c = container({ scopeOverrides: [mPatch] });
    expect(c.get(m, 'someValue').value).toEqual(6);
  });

  describe(`scopeOverrides`, () => {
    it(`preserves singleton scope of the original resolver`, async () => {
      const m = module()
        .define('a', singleton, () => Math.random())
        .build();

      const mPatch = m.apply('a', a => a);

      const c = container({ scopeOverrides: [mPatch] });
      expect(c.get(m, 'a')).toEqual(c.get(m, 'a'));
    });

    it(`preserves transient scope of the original resolver`, async () => {
      const m = module()
        .define('a', transient, () => Math.random())
        .build();

      const mPatch = m.apply('a', a => a);

      const c = container({ scopeOverrides: [mPatch] });
      expect(c.get(m, 'a')).not.toEqual(c.get(m, 'a'));
    });

    it(`preserves request scope of the original resolver`, async () => {
      const m = module()
        .define('source', request, () => Math.random())
        .define('a', request, ({ source }) => source)
        .build();

      const mPatch = m.apply('a', a => a);

      const c = container({ scopeOverrides: [mPatch] });
      const req1 = c.asObject(m);
      const req2 = c.asObject(m);

      expect(req1.source).toEqual(req1.a);
      expect(req2.source).toEqual(req2.a);
      expect(req1.source).not.toEqual(req2.source);
      expect(req1.a).not.toEqual(req2.a);
    });

    it(`does not change original strategy`, async () => {
      const m = module()
        .define('a', request, () => Math.random())
        .define('b', request, () => Math.random())
        .build();

      const c = container();
      const obj1 = c.asObject(m);
      const obj2 = c.asObject(m);

      expect(obj1).not.toBe(obj2);
    });
  });

  describe(`globalOverrides`, () => {
    function setup(strategy: (buildFunction: (ctx) => MyService) => BuildStrategy<MyService>) {
      const m = module()
        .define('a', strategy, () => new MyService())
        .build();

      const mPatch = m.apply('a', a => jest.spyOn(a, 'callMe'));

      const scope1 = container({ globalOverrides: [mPatch] });
      const scope2 = scope1.checkoutScope({ scopeOverrides: [m.replace('a', () => ({ callMe: () => {} }))] });
      const instance1 = scope1.get(m, 'a');
      const instance2 = scope2.get(m, 'a');
      return { instance1, instance2 };
    }

    class MyService {
      callMe(...args: any[]) {}
    }

    describe(`apply on singleton definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(singleton);
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on scoped definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(scoped);
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on transients definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(transient);
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });

    describe(`apply on request definition`, () => {
      it(`guarantees that only single instance will be available in all scopes`, async () => {
        const { instance1, instance2 } = setup(request);
        instance1.callMe(1, 2);

        expect(instance1.callMe).toHaveBeenCalledWith(1, 2);
        expect(instance1).toBe(instance2);
      });
    });
  });
});

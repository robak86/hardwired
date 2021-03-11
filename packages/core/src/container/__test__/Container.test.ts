import { container } from '../Container';

import { ArgsDebug } from '../../__test__/ArgsDebug';
import { module, unit } from '../../module/ModuleBuilder';
import { singleton } from '../../strategies/SingletonStrategy';
import { request } from '../../strategies/RequestStrategy';
import { scoped } from '../../strategies/ScopeStrategy';
import { transient } from '../../strategies/TransientStrategy';

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const child2 = module()
        .define('c', singleton, () => 'cValue')
        .define('d', singleton, () => 'dValue')
        .build();
      const c = container();

      const cValue = c.get(child2, 'c');
      expect(cValue).toEqual('cValue');
    });

    it(`lazily appends new module if module cannot be found`, async () => {
      const notRegistered = module() // breakme
        .define('a', singleton, () => 1)
        .build();

      const c = container();

      expect(c.get(notRegistered, 'a')).toEqual(1);
    });
  });

  describe(`.getByStrategy`, () => {
    it(`returns all instances by given strategy`, async () => {
      const m = unit()
        .define('a', singleton, () => 1)
        .define('b', singleton, () => 2)
        .define('c', transient, () => 3)
        .build();

      const c = container({ eager: [m] });
      const allSingletons = c.getByStrategy(singleton);
      expect(allSingletons).toEqual([1, 2]);
    });

    it(`replaces eagerly loaded modules with overrides`, async () => {
      const m = unit()
        .define('a', singleton, () => 1)
        .define('b', singleton, () => 2)
        .define('c', transient, () => 3)
        .build();

      const c = container({
        eager: [m],
        overrides: [m.replace('b', () => 20, singleton)],
      });

      const allSingletons = c.getByStrategy(singleton);
      expect(allSingletons).toEqual([1, 20]);
    });

    it(`uses replaces strategy for filtering`, async () => {
      const m = unit()
        .define('a', singleton, () => 1)
        .define('b', singleton, () => 2)
        .define('c', transient, () => 3)
        .build();

      const c = container({
        eager: [m],
        overrides: [m.replace('b', () => 20, transient)],
      });

      const allSingletons = c.getByStrategy(singleton);
      expect(allSingletons).toEqual([1]);
    });
  });

  describe(`.replace`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const m = module()
          .define('a', singleton, () => 1)
          .build();
        const mPatch = m.replace('a', () => 2);
        expect(container({ overrides: [mPatch] }).get(m, 'a')).toEqual(2);
      });

      it(`calls provided function with materialized module`, async () => {
        const m = module()
          .define('b', singleton, () => 2)
          .define('a', singleton, () => 1)
          .build();

        const factoryFunctionSpy = jest.fn().mockImplementation(ctx => {
          return () => 3;
        });

        const mPatch = m.replace('a', factoryFunctionSpy);

        const testContainer = container({ overrides: [mPatch] });
        testContainer.get(m, 'a');

        expect({ ...factoryFunctionSpy.mock.calls[0][0] }).toEqual({ ...testContainer.asObject(m) });
      });

      it(`forbids to reference replaced value from the context`, async () => {
        const m = module()
          .define('b', singleton, () => 2)
          .define('a', singleton, () => 1)
          .build();

        const updated = m.replace('a', ctx => {
          // @ts-expect-error - a shouldn't be available in the ctx to avoid Maximum call stack size exceeded
          ctx.a;
          return singleton(() => 1);
        });
      });

      it(`does not affect other definitions`, async () => {
        const m = module()
          .define('a', singleton, () => 1)
          .define('b', singleton, () => 'b')
          .build();

        const mPatch = m.replace('a', () => 2);
        expect(container({ overrides: [mPatch] }).get(m, 'b')).toEqual('b');
      });

      it.skip(`can use all previously registered definitions`, async () => {
        const m = module()
          .define('a', singleton, () => 'a')
          .define('aa', singleton, () => 'replaced')
          .define('b', singleton, ({ a }) => new ArgsDebug(a))
          .define('c', singleton, ({ b }) => new ArgsDebug(b))
          .build();

        // @ts-expect-error - one can replace definition only with the same type - string is not compatible with ArgsDebug Class
        const updated = m.replaceAdvanced('b', value('bReplaced'));

        expect(container().get(m, 'b').args).toEqual(['a']);
      });
    });
  });

  describe(`overrides`, () => {
    it(`merges modules with the same id`, async () => {
      const m = module()
        .define('a', singleton, () => 1)
        .define('b', singleton, () => 2)
        .define('a_plus_b', singleton, ({ a, b }) => a + b)
        .build();

      const c = container({
        overrides: [
          //breakme
          m.replace('a', () => 10),
          m.replace('b', () => 20),
        ],
      });

      const { a_plus_b } = c.asObject(m);
      expect(a_plus_b).toEqual(30);
    });

    describe(`overrides for child scope`, () => {
      it(`replaces definitions for request scope`, async () => {
        const m = unit()
          .define('a', request, () => 1)
          .build();
        const c = container();

        const mPatch = m.replace('a', () => 2, request);
        const childC = c.checkoutChildScope({ overrides: [mPatch] });

        expect(c.get(m, 'a')).toEqual(1);
        expect(childC.get(m, 'a')).toEqual(2);
      });

      it(`replaces definitions for scoped scope`, async () => {
        const m = unit()
          .define('a', scoped, () => 1)
          .build();
        const c = container();
        expect(c.get(m, 'a')).toEqual(1);

        const mPatch = m.replace('a', () => 2, scoped);
        const childC = c.checkoutChildScope({ overrides: [mPatch] });
        expect(childC.get(m, 'a')).toEqual(2);
      });

      it(`replaces definitions for singleton scope`, async () => {
        const m = unit()
          .define('a', singleton, () => 1)
          .build();
        const c = container();

        const mPatch = m.replace('a', () => 2, singleton);
        const childC = c.checkoutChildScope({ overrides: [mPatch] });

        expect(childC.get(m, 'a')).toEqual(2);
        expect(c.get(m, 'a')).toEqual(1);
      });

      it(`inherits singletons from parent scope for singleton`, async () => {
        const m = unit()
          .define('a', singleton, () => 1)
          .build();
        const root = container();

        const patch = m.replace('a', () => 2, singleton);
        const level1 = root.checkoutChildScope({ overrides: [patch] });
        const level2 = level1.checkoutChildScope();

        expect(level2.get(m, 'a')).toEqual(2);
        expect(root.get(m, 'a')).toEqual(1);
      });

      it(`propagates singletons created in child scope to parent scope (if not replaced with patches)`, async () => {
        const m = unit()
          .define('a', singleton, () => Math.random())
          .build();
        const parentC = container();
        const childC = parentC.checkoutChildScope();

        const req1 = childC.get(m, 'a'); // important that childC is called as first
        const req2 = parentC.get(m, 'a');
        expect(req1).toEqual(req2);
      });

      it(`propagates singletons created in descendent scope to first ascendant scope which does not overrides definition`, async () => {
        const randomFactorySpy = jest.fn().mockImplementation(() => Math.random());

        const m = unit().define('a', singleton, randomFactorySpy).build();

        const root = container();
        const level1 = root.checkoutChildScope();
        const level2 = level1.checkoutChildScope({ overrides: [m.replace('a', () => 1)] });
        const level3 = level2.checkoutChildScope();

        const level3Call = level3.get(m, 'a'); // important that level1 is called as first
        const level2Call = level2.get(m, 'a');
        const level1Call = level1.get(m, 'a');
        const rootCall = root.get(m, 'a');

        expect(level1Call).toEqual(rootCall);
        expect(level2Call).toEqual(1);
        expect(level3Call).toEqual(1);
        expect(randomFactorySpy).toHaveBeenCalledTimes(1);
      });

      it(`does not propagate singletons created in descendent scope to ascendant scopes if all ascendant scopes has patched value`, async () => {
        const randomFactorySpy = jest.fn().mockImplementation(() => Math.random());

        const m = unit().define('a', singleton, randomFactorySpy).build();

        const root = container();
        const level1 = root.checkoutChildScope({ overrides: [m.replace('a', () => 1)] });
        const level2 = level1.checkoutChildScope({ overrides: [m.replace('a', () => 2)] });
        const level3 = level2.checkoutChildScope();

        const level3Call = level3.get(m, 'a'); // important that level1 is called as first
        const level2Call = level2.get(m, 'a');
        const level1Call = level1.get(m, 'a');
        const rootCall = root.get(m, 'a');

        expect(level3Call).toEqual(level2Call);
        expect(level2Call).toEqual(2);
        expect(level1Call).toEqual(1);
        expect(rootCall).not.toEqual(level3);
        expect(randomFactorySpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('invariant resolvers', function () {
      describe(`request scope`, () => {
        it(`cannot be replaced by overrides`, async () => {
          const m = module()
            .define('k1', request, () => Math.random())
            .build();

          const invariantPatch = m.replace('k1', () => 1, request);
          const childScopePatch = m.replace('k1', () => 2, request);

          const c = container({ invariants: [invariantPatch] });
          expect(c.asObject(m).k1).toEqual(1);

          const childScope = c.checkoutChildScope({ overrides: [childScopePatch] });
          expect(childScope.asObject(m).k1).toEqual(1);
        });

        it(`allows for overrides for other keys than ones changes invariants array`, async () => {
          const m = module()
            .define('k1', request, () => Math.random())
            .define('k2', request, () => Math.random())
            .build();

          const invariantPatch = m.replace('k1', () => 1, request);
          const childScopePatch = m.replace('k2', () => 2, request);

          const c = container({ invariants: [invariantPatch] });
          expect(c.asObject(m).k1).toEqual(1);

          const childScope = c.checkoutChildScope({ overrides: [childScopePatch] });
          expect(childScope.asObject(m).k1).toEqual(1);
          expect(childScope.asObject(m).k2).toEqual(2);
        });
      });

      describe(`singleton scope`, () => {
        it(`cannot be replaced by overrides`, async () => {
          const m = module()
            .define('k1', singleton, () => Math.random())
            .build();

          const invariantPatch = m.replace('k1', () => 1, singleton);
          const childScopePatch = m.replace('k1', () => 2, singleton);

          const c = container({ invariants: [invariantPatch] });
          expect(c.asObject(m).k1).toEqual(1);

          const childScope = c.checkoutChildScope({ overrides: [childScopePatch] });
          expect(childScope.asObject(m).k1).toEqual(1);
        });

        it(`allows for overrides for other keys than ones changes invariants array`, async () => {
          const m = module()
            .define('k1', singleton, () => Math.random())
            .define('k2', singleton, () => Math.random())
            .build();

          const invariantPatch = m.replace('k1', () => 1, singleton);
          const childScopePatch = m.replace('k2', () => 2, singleton);

          const c = container({ invariants: [invariantPatch] });
          expect(c.asObject(m).k1).toEqual(1);

          const childScope = c.checkoutChildScope({ overrides: [childScopePatch] });
          expect(childScope.asObject(m).k1).toEqual(1);
          expect(childScope.asObject(m).k2).toEqual(2);
        });
      });
    });
  });

  describe(`asObjectMany`, () => {
    it(`returns array of materialized modules`, async () => {
      const m1 = unit()
        .define('a', request, () => 1)
        .build();

      const m2 = unit()
        .define('b', request, () => 2)
        .build();

      const c = container();
      const [{ a }, { b }] = c.asObjectMany(m1, m2);
      expect(a).toEqual(1);
      expect(b).toEqual(2);
    });
  });

  describe(`scopes`, () => {
    describe(`request`, () => {
      describe(`get`, () => {
        it(`uses new request scope for each call`, async () => {
          const m = unit()
            .define('a', request, () => Math.random())
            .build();

          const c = container();
          const req1 = c.get(m, 'a');
          const req2 = c.get(m, 'a');

          expect(req1).not.toEqual(req2);
        });
      });

      describe(`asObject`, () => {
        it(`runs asObject each time with new request scope `, async () => {
          const m = unit()
            .define('a', request, () => Math.random())
            .build();

          const c = container();
          const req1 = c.asObject(m);
          const req2 = c.asObject(m);

          expect(req1.a).not.toEqual(req2.a);
        });
      });

      describe(`childScope`, () => {
        it(`does not inherit any values from parent scope`, async () => {
          const m = unit()
            .define('a', request, () => Math.random())
            .build();

          const c = container();
          const req1 = c.asObject(m);

          const childC = c.checkoutChildScope();
          const req2 = childC.asObject(m);

          expect(req1.a).not.toEqual(req2.a);
        });
      });
    });
  });

  describe(`scoped`, () => {
    it(`acts like singleton limited to given scope`, async () => {
      const m = unit()
        .define('a', scoped, () => Math.random())
        .build();

      const c = container();
      expect(c.get(m, 'a')).toEqual(c.get(m, 'a'));

      const childScope = c.checkoutChildScope();
      expect(childScope.get(m, 'a')).toEqual(childScope.get(m, 'a'));
      expect(c.get(m, 'a')).not.toEqual(childScope.get(m, 'a'));
    });
  });

  describe(`async definition`, () => {
    it(`properly resolves async definitions`, async () => {
      let counter = 0;
      const u = module()
        .define('k1', singleton, async () => (counter += 1))
        .define('k2', singleton, async () => (counter += 1))
        .define('k3', singleton, async ({ k1, k2 }) => (await k1) + (await k2))
        .build();

      const c = container();
      const { k3 } = c.asObject(u);
      expect(await k3).toEqual(3);
    });

    it(`does not evaluated promise if key is not accessed`, async () => {
      let counter = 0;
      const k1Factory = jest.fn(async () => (counter += 1));
      const k2Factory = jest.fn(async () => (counter += 1));
      const k3Factory = jest.fn(async ({ k1, k2 }) => (await k1) + (await k2));

      const u = module()
        .define('k1', singleton, k1Factory)
        .define('k2', singleton, k2Factory)
        .define('k3', singleton, k3Factory)
        .build();

      const c = container();
      const { k1 } = c.asObject(u);
      const { k1: k1NextRequest } = c.asObject(u);
      expect(k1Factory).toHaveBeenCalledTimes(1);
      expect(k2Factory).not.toHaveBeenCalled();
      expect(k3Factory).not.toHaveBeenCalled();
    });
  });
});

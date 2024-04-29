import { scoped } from '../../definitions/definitions.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { replace } from '../../patching/replace.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { describe, it, expect, vi } from 'vitest';
import { container } from '../../container/Container.js';

describe(`ScopeStrategy`, () => {
  describe(`resolution`, () => {
    it(`acts like singleton within current scope`, async () => {
      const a = scoped.fn(() => Math.random());

      const c = ContainerContext.empty();
      expect(c.use(a)).toEqual(c.use(a));

      const childScope = c.checkoutScope();
      expect(childScope.use(a)).toEqual(childScope.use(a));
      expect(c.use(a)).not.toEqual(childScope.use(a));
    });

    it(`returns new instance in new scope`, async () => {
      const a = scoped.fn(() => Math.random());
      const c = ContainerContext.empty();

      const childScope = c.checkoutScope();
      expect(childScope.use(a)).toEqual(childScope.use(a));
      expect(c.use(a)).not.toEqual(childScope.use(a));
    });
  });

  describe(`global overrides`, () => {
    it(`cannot be replaced by scope overrides if parent scope was created with global override`, async () => {
      class Boxed {
        constructor(public value = Math.random()) {}
      }

      const k1 = scoped.fn(() => new Boxed());

      const invariantPatch = replace(
        k1,
        scoped.fn(() => new Boxed(1)),
      );
      const childScopePatch = replace(
        k1,
        scoped.fn(() => new Boxed(1)),
      );

      const c = ContainerContext.create([], [invariantPatch]);

      expect(c.use(k1).value).toEqual(1);

      const childScope = c.checkoutScope({ overrides: [childScopePatch] });
      expect(childScope.use(k1).value).toEqual(1);

      expect(c.use(k1)).toBe(childScope.use(k1));
    });

    it(`allows for overrides other than specified in globalOverrides`, async () => {
      const k1 = scoped.fn(() => Math.random());
      const k2 = scoped.fn(() => Math.random());

      const invariantPatch = replace(
        k1,
        scoped.fn(() => 1),
      );
      const childScopePatch = replace(
        k2,
        scoped.fn(() => 2),
      );

      const c = ContainerContext.create([], [invariantPatch]);
      expect(c.use(k1)).toEqual(1);

      const childScope = c.checkoutScope({ overrides: [childScopePatch] });
      expect(childScope.use(k1)).toEqual(1);
      expect(childScope.use(k2)).toEqual(2);
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for scoped scope`, async () => {
      const a = scoped.fn(() => new BoxedValue(1));

      const c = ContainerContext.empty();
      expect(c.use(a).value).toEqual(1);

      const mPatch = replace(
        a,
        scoped.fn(() => new BoxedValue(2)),
      );
      const childC = c.checkoutScope({ overrides: [mPatch] });
      expect(childC.use(a).value).toEqual(2);
    });

    it(`new scope inherits parent scope overrides`, async () => {
      const a = scoped.fn(() => new BoxedValue(1));

      const root = ContainerContext.empty();
      expect(root.use(a).value).toEqual(1);

      const mPatch = replace(
        a,
        scoped.fn(() => new BoxedValue(2)),
      );
      const childC = root.checkoutScope({ overrides: [mPatch] });
      expect(childC.use(a).value).toEqual(2);

      const grandChildC = childC.checkoutScope();
      expect(grandChildC.use(a).value).toEqual(2);

      expect(childC.use(a)).not.toBe(grandChildC.use(a));
    });
  });

  describe(`sync definitions`, () => {
    describe(`resolution`, () => {
      describe(`get`, () => {
        it(`uses the same scope for the request`, async () => {
          const a = scoped.fn(() => Math.random());

          const c = container();
          const req1 = c.use(a);
          const req2 = c.use(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`childScope`, () => {
        it(`does not inherit any values from parent scope`, async () => {
          const a = scoped.fn(() => Math.random());

          const c = ContainerContext.empty();
          const req1 = c.use(a);

          const childC = c.checkoutScope();
          const req2 = childC.use(a);

          expect(req1).not.toEqual(req2);
        });
      });
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for request scope`, async () => {
        const a = scoped.fn(() => 1);

        const c = ContainerContext.empty();

        const mPatch = replace(
          a,
          scoped.fn(() => 2),
        );

        const childC = c.checkoutScope({ overrides: [mPatch] });

        expect(c.use(a)).toEqual(1);
        expect(childC.use(a)).toEqual(2);
      });
    });

    describe(`global overrides`, () => {
      it(`cannot be replaced by scope overrides`, async () => {
        const k1 = scoped.fn(() => Math.random());

        const invariantPatch = replace(
          k1,
          scoped.fn(() => 1),
        );
        const childScopePatch = replace(
          k1,
          scoped.fn(() => 2),
        );

        const c = ContainerContext.create([], [invariantPatch]);
        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(childScope.use(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
        const k1 = scoped.fn(() => Math.random());
        const k2 = scoped.fn(() => Math.random());

        const invariantPatch = replace(
          k1,
          scoped.fn(() => 1),
        );
        const childScopePatch = replace(
          k2,
          scoped.fn(() => 2),
        );

        const c = ContainerContext.create([], [invariantPatch]);
        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(childScope.use(k1)).toEqual(1);
        expect(childScope.use(k2)).toEqual(2);
      });
    });
  });

  describe(`async definitions`, () => {
    describe(`resolution`, () => {
      describe(`get`, () => {
        it(`uses the same scope for each call`, async () => {
          const a = scoped.async().fn(async () => Math.random());

          const c = container();
          const req1 = await c.use(a);
          const req2 = await c.use(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`asObject`, () => {
        it(`runs asObject each time with new request scope `, async () => {
          const a = scoped.async().fn(async () => Math.random());

          const c = container();
          const req1 = await c.use(a);
          const req2 = await c.use(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`childScope`, () => {
        it(`does not inherit any values from parent scope`, async () => {
          const a = scoped.async().fn(async () => Math.random());

          const c = ContainerContext.empty();
          const req1 = await c.use(a);

          const childC = c.checkoutScope();
          const req2 = childC.use(a);

          expect(req1).not.toEqual(req2);
        });
      });
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for request scope`, async () => {
        const a = scoped.async().fn(async () => 1);

        const c = ContainerContext.empty();

        const mPatch = replace(
          a,
          scoped.async().fn(async () => 2),
        );

        const childC = c.checkoutScope({ overrides: [mPatch] });

        expect(await c.use(a)).toEqual(1);
        expect(await childC.use(a)).toEqual(2);
      });
    });

    describe(`global overrides`, () => {
      it(`cannot be replaced by scope overrides`, async () => {
        const k1 = scoped.async().fn(async () => Math.random());

        const invariantPatch = replace(
          k1,
          scoped.async().fn(async () => 1),
        );
        const childScopePatch = replace(
          k1,
          scoped.async().fn(async () => 2),
        );

        const c = ContainerContext.create([], [invariantPatch]);

        expect(await c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(await childScope.use(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
        const k1 = scoped.async().fn(async () => Math.random());
        const k2 = scoped.async().fn(async () => Math.random());

        const invariantPatch = replace(
          k1,
          scoped.async().fn(async () => 1),
        );
        const childScopePatch = replace(
          k2,
          scoped.async().fn(async () => 2),
        );

        const c = ContainerContext.create([], [invariantPatch]);
        expect(await c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(await childScope.use(k1)).toEqual(1);
        expect(await childScope.use(k2)).toEqual(2);
      });
    });
  });
});

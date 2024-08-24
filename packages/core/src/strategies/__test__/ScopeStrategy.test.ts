import { fn } from '../../definitions/definitions.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { describe, expect, it } from 'vitest';
import { container } from '../../container/Container.js';

describe(`ScopeStrategy`, () => {
  describe(`resolution`, () => {
    it(`acts like singleton within current scope`, async () => {
      const a = fn.scoped(() => Math.random());

      const c = ContainerContext.empty();
      expect(c.requestCall(a)).toEqual(c.requestCall(a));

      const childScope = c.checkoutScope();
      expect(childScope.requestCall(a)).toEqual(childScope.requestCall(a));
      expect(c.requestCall(a)).not.toEqual(childScope.requestCall(a));
    });

    it(`returns new instance in new scope`, async () => {
      const a = fn.scoped(() => Math.random());
      const c = ContainerContext.empty();

      const childScope = c.checkoutScope();
      expect(childScope.requestCall(a)).toEqual(childScope.requestCall(a));
      expect(c.requestCall(a)).not.toEqual(childScope.requestCall(a));
    });
  });

  describe(`global overrides`, () => {
    it(`cannot be replaced by scope overrides if parent scope was created with global override`, async () => {
      class Boxed {
        constructor(public value = Math.random()) {}
      }

      const k1 = fn.scoped(() => new Boxed());

      const globalOverride = k1.patch().replace(fn.scoped(() => new Boxed(1)));
      const childScopePatch = k1.patch().replace(fn.scoped(() => new Boxed(2)));

      const c = ContainerContext.create([], [globalOverride]);

      expect(c.requestCall(k1).value).toEqual(1);

      const childScope = c.checkoutScope({ overrides: [childScopePatch] });
      expect(childScope.requestCall(k1).value).toEqual(1);

      expect(c.requestCall(k1)).toBe(childScope.requestCall(k1));
    });

    it(`allows for overrides other than specified in globalOverrides`, async () => {
      const k1 = fn.scoped(() => Math.random());
      const k2 = fn.scoped(() => Math.random());

      const invariantPatch = k1.patch().replace(fn.scoped(() => 1));
      const childScopePatch = k2.patch().replace(fn.scoped(() => 2));

      const c = ContainerContext.create([], [invariantPatch]);
      expect(c.requestCall(k1)).toEqual(1);

      const childScope = c.checkoutScope({ overrides: [childScopePatch] });
      expect(childScope.requestCall(k1)).toEqual(1);
      expect(childScope.requestCall(k2)).toEqual(2);
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for scoped scope`, async () => {
      const a = fn.scoped(() => new BoxedValue(1));

      const c = ContainerContext.empty();
      expect(c.requestCall(a).value).toEqual(1);

      const mPatch = a.patch().replace(fn.scoped(() => new BoxedValue(2)));
      const childC = c.checkoutScope({ overrides: [mPatch] });
      expect(childC.requestCall(a).value).toEqual(2);
    });

    it(`new scope inherits parent scope overrides`, async () => {
      const a = fn.scoped(() => new BoxedValue(1));

      const root = ContainerContext.empty();
      expect(root.requestCall(a).value).toEqual(1);

      const mPatch = a.patch().replace(fn.scoped(() => new BoxedValue(2)));
      const childC = root.checkoutScope({ overrides: [mPatch] });
      expect(childC.requestCall(a).value).toEqual(2);

      const grandChildC = childC.checkoutScope();
      expect(grandChildC.requestCall(a).value).toEqual(2);

      expect(childC.requestCall(a)).not.toBe(grandChildC.requestCall(a));
    });
  });

  describe(`sync definitions`, () => {
    describe(`resolution`, () => {
      describe(`get`, () => {
        it(`uses the same scope for the request`, async () => {
          const a = fn.scoped(() => Math.random());

          const c = container();
          const req1 = c.call(a);
          const req2 = c.call(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`childScope`, () => {
        it(`does not inherit any values from parent scope`, async () => {
          const a = fn.scoped(() => Math.random());

          const c = ContainerContext.empty();
          const req1 = c.requestCall(a);

          const childC = c.checkoutScope();
          const req2 = childC.requestCall(a);

          expect(req1).not.toEqual(req2);
        });
      });
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for request scope`, async () => {
        const a = fn.scoped(() => 1);

        const c = ContainerContext.empty();

        const mPatch = a.patch().replace(fn.scoped(() => 2));

        const childC = c.checkoutScope({ overrides: [mPatch] });

        expect(c.requestCall(a)).toEqual(1);
        expect(childC.requestCall(a)).toEqual(2);
      });
    });

    describe(`global overrides`, () => {
      it(`cannot be replaced by scope overrides`, async () => {
        const k1 = fn.scoped(() => Math.random());

        const invariantPatch = k1.patch().replace(fn.scoped(() => 1));
        const childScopePatch = k1.patch().replace(fn.scoped(() => 2));

        const c = ContainerContext.create([], [invariantPatch]);
        expect(c.requestCall(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(childScope.requestCall(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
        const k1 = fn.scoped(() => Math.random());
        const k2 = fn.scoped(() => Math.random());

        const invariantPatch = k1.patch().replace(fn.scoped(() => 1));
        const childScopePatch = k2.patch().replace(fn.scoped(() => 2));

        const c = ContainerContext.create([], [invariantPatch]);
        expect(c.requestCall(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(childScope.requestCall(k1)).toEqual(1);
        expect(childScope.requestCall(k2)).toEqual(2);
      });
    });
  });

  describe(`async definitions`, () => {
    describe(`resolution`, () => {
      describe(`get`, () => {
        it(`uses the same scope for each call`, async () => {
          const a = fn.scoped(async () => Math.random());

          const c = container();
          const req1 = await c.call(a);
          const req2 = await c.call(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`asObject`, () => {
        it(`runs asObject each time with new request scope `, async () => {
          const a = fn.scoped(async () => Math.random());

          const c = container();
          const req1 = await c.call(a);
          const req2 = await c.call(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`childScope`, () => {
        it(`does not inherit any values from parent scope`, async () => {
          const a = fn.scoped(async () => Math.random());

          const c = ContainerContext.empty();
          const req1 = await c.requestCall(a);

          const childC = c.checkoutScope();
          const req2 = childC.requestCall(a);

          expect(req1).not.toEqual(req2);
        });
      });
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for request scope`, async () => {
        const a = fn.scoped(async () => 1);

        const c = ContainerContext.empty();

        const mPatch = a.patch().replace(fn.scoped(async () => 2));
        const childC = c.checkoutScope({ overrides: [mPatch] });

        expect(await c.requestCall(a)).toEqual(1);
        expect(await childC.requestCall(a)).toEqual(2);
      });
    });

    describe(`global overrides`, () => {
      it(`cannot be replaced by scope overrides`, async () => {
        const k1 = fn.scoped(async () => Math.random());

        const invariantPatch = k1.patch().replace(fn.scoped(async () => 1));
        const childScopePatch = k1.patch().replace(fn.scoped(async () => 2));

        const c = ContainerContext.create([], [invariantPatch]);

        expect(await c.requestCall(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(await childScope.requestCall(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
        const k1 = fn.scoped(async () => Math.random());
        const k2 = fn.scoped(async () => Math.random());

        const invariantPatch = k1.patch().replace(fn.scoped(async () => 1));
        const childScopePatch = k2.patch().replace(fn.scoped(async () => 2));

        const c = ContainerContext.create([], [invariantPatch]);
        expect(await c.requestCall(k1)).toEqual(1);

        const childScope = c.checkoutScope({ overrides: [childScopePatch] });
        expect(await childScope.requestCall(k1)).toEqual(1);
        expect(await childScope.requestCall(k2)).toEqual(2);
      });
    });
  });
});

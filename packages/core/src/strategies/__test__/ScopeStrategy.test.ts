import { fn } from '../../definitions/definitions.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { describe, expect, it } from 'vitest';
import { container } from '../../container/Container.js';

describe(`ScopeStrategy`, () => {
  describe(`resolution`, () => {
    it(`acts like singleton within current scope`, async () => {
      const a = fn.scoped(() => Math.random());

      const c = container.new();
      expect(c.use(a)).toEqual(c.use(a));

      const childScope = c.checkoutScope();
      expect(childScope.use(a)).toEqual(childScope.use(a));
      expect(c.use(a)).not.toEqual(childScope.use(a));
    });

    it(`returns new instance in new scope`, async () => {
      const a = fn.scoped(() => Math.random());
      const c = container.new();

      const childScope = c.checkoutScope();
      expect(childScope.use(a)).toEqual(childScope.use(a));
      expect(c.use(a)).not.toEqual(childScope.use(a));
    });
  });

  describe(`final overrides`, () => {
    it(`cannot be replaced by scope overrides if parent scope was created with global override`, async () => {
      class Boxed {
        constructor(public value = Math.random()) {}
      }

      const k1 = fn.scoped(() => new Boxed());

      const globalOverride = k1.bindTo(fn.scoped(() => new Boxed(1)));
      const childScopePatch = k1.bindTo(fn.scoped(() => new Boxed(2)));

      const c = container.new({ final: [globalOverride] });

      expect(c.use(k1).value).toEqual(1);

      const childScope = c.checkoutScope({ scope: [childScopePatch] });
      expect(childScope.use(k1).value).toEqual(1);

      expect(c.use(k1)).toBe(childScope.use(k1));
    });

    it(`is possible to set final from child scope`, async () => {
      class Boxed {
        constructor(public value = Math.random()) {}
      }

      const k1 = fn.scoped(() => new Boxed());

      const finalBinding = k1.bindTo(fn.scoped(() => new Boxed(1)));
      const scopeBinding = k1.bindTo(fn.scoped(() => new Boxed(2)));

      const root = container.new({});
      const child = root.checkoutScope({ final: [finalBinding] });
      const grandChild = child.checkoutScope({ scope: [scopeBinding] }); // scopeBinding is ignored because of finalBinding

      expect(root.use(k1).value).toEqual(root.use(k1).value);
      expect(child.use(k1).value).toEqual(1);
      expect(grandChild.use(k1).value).toEqual(1);
    });

    it(`allows for overrides other than specified in final bindings`, async () => {
      const k1 = fn.scoped(() => Math.random());
      const k2 = fn.scoped(() => Math.random());

      const parentBinding = k1.bindTo(fn.scoped(() => 1));
      const scopeBinding = k2.bindTo(fn.scoped(() => 2));

      const c = container.new({ final: [parentBinding] });
      expect(c.use(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scope: [scopeBinding] });
      expect(childScope.use(k1)).toEqual(1);
      expect(childScope.use(k2)).toEqual(2);
    });

    describe(`child scope sets final overrides for singleton`, () => {
      it(`creates own copy of singleton available for the scope`, async () => {
        const a = fn.singleton(() => 0);

        const root = container.new();
        const childScope = root.checkoutScope({ final: [a.bindValue(1)] });

        // cannot redefine final scopes
        expect(() => childScope.checkoutScope({ final: [a.bindValue(2)] })).toThrow('Cannot override it');

        expect(root.use(a)).toEqual(0);
        expect(childScope.use(a)).toEqual(1);
      });
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for scoped scope`, async () => {
      const a = fn.scoped(() => new BoxedValue(1));

      const c = container.new();

      expect(c.use(a).value).toEqual(1);

      const mPatch = a.bindTo(fn.scoped(() => new BoxedValue(2)));
      const childC = c.checkoutScope({ scope: [mPatch] });
      expect(childC.use(a).value).toEqual(2);
    });

    it(`new scope inherits parent scope overrides`, async () => {
      const a = fn.scoped(() => new BoxedValue(1));

      const root = container.new();
      expect(root.use(a).value).toEqual(1);

      const mPatch = a.bindTo(fn.scoped(() => new BoxedValue(2)));
      const childC = root.checkoutScope({ scope: [mPatch] });
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
          const a = fn.scoped(() => Math.random());

          const c = container.new();
          const req1 = c.use(a);
          const req2 = c.use(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`childScope`, () => {
        it(`does not inherit any values from parent scope`, async () => {
          const a = fn.scoped(() => Math.random());

          const c = container.new();
          const req1 = c.use(a);

          const childC = c.checkoutScope();
          const req2 = childC.use(a);

          expect(req1).not.toEqual(req2);
        });
      });
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for request scope`, async () => {
        const a = fn.scoped(() => 1);

        const c = container.new();

        const mPatch = a.bindTo(fn.scoped(() => 2));

        const childC = c.checkoutScope({ scope: [mPatch] });

        expect(c.use(a)).toEqual(1);
        expect(childC.use(a)).toEqual(2);
      });
    });

    describe(`global overrides`, () => {
      it(`cannot be replaced by scope overrides`, async () => {
        const k1 = fn.scoped(() => Math.random());

        const invariantPatch = k1.bindTo(fn.scoped(() => 1));
        const childScopePatch = k1.bindTo(fn.scoped(() => 2));

        const c = container.new({ final: [invariantPatch] });
        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ scope: [childScopePatch] });
        expect(childScope.use(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
        const k1 = fn.scoped(() => Math.random());
        const k2 = fn.scoped(() => Math.random());

        const finalBinding = k1.bindTo(fn.scoped(() => 1));
        const scopeBinding = k2.bindTo(fn.scoped(() => 2));

        const c = container.new({ final: [finalBinding] });
        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ scope: [scopeBinding] });
        expect(childScope.use(k1)).toEqual(1);
        expect(childScope.use(k2)).toEqual(2);
      });
    });
  });

  describe(`async definitions`, () => {
    describe(`resolution`, () => {
      describe(`get`, () => {
        it(`uses the same scope for each call`, async () => {
          const a = fn.scoped(async () => Math.random());

          const c = container.new();
          const req1 = await c.use(a);
          const req2 = await c.use(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`asObject`, () => {
        it(`runs asObject each time with new request scope `, async () => {
          const a = fn.scoped(async () => Math.random());

          const c = container.new();
          const req1 = await c.use(a);
          const req2 = await c.use(a);

          expect(req1).toEqual(req2);
        });
      });

      describe(`childScope`, () => {
        it(`does not inherit any values from parent scope`, async () => {
          const a = fn.scoped(async () => Math.random());

          const c = container.new();
          const req1 = await c.use(a);

          const childC = c.checkoutScope();
          const req2 = childC.use(a);

          expect(req1).not.toEqual(req2);
        });
      });
    });

    describe(`scope overrides`, () => {
      it(`replaces definitions for request scope`, async () => {
        const a = fn.scoped(async () => 1);

        const c = container.new();

        const mPatch = a.bindTo(fn.scoped(async () => 2));
        const childC = c.checkoutScope({ scope: [mPatch] });

        expect(await c.use(a)).toEqual(1);
        expect(await childC.use(a)).toEqual(2);
      });
    });

    describe(`global overrides`, () => {
      it(`cannot be replaced by scope overrides`, async () => {
        const k1 = fn.scoped(async () => Math.random());

        const invariantPatch = k1.bindTo(fn.scoped(async () => 1));
        const childScopePatch = k1.bindTo(fn.scoped(async () => 2));

        const c = container.new({ final: [invariantPatch] });

        expect(await c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ scope: [childScopePatch] });
        expect(await childScope.use(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
        const k1 = fn.scoped(async () => Math.random());
        const k2 = fn.scoped(async () => Math.random());

        const invariantPatch = k1.bindTo(fn.scoped(async () => 1));
        const childScopePatch = k2.bindTo(fn.scoped(async () => 2));

        const c = container.new({ final: [invariantPatch] });
        expect(await c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope({ scope: [childScopePatch] });
        expect(await childScope.use(k1)).toEqual(1);
        expect(await childScope.use(k2)).toEqual(2);
      });
    });
  });
});

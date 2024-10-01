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

      const c = container.new(c => {
        c.freeze(k1).to(fn.scoped(() => new Boxed(1)));
      });

      expect(c.use(k1).value).toEqual(1);

      const childScope = c.checkoutScope(c => {
        c.bindLocal(k1).to(fn.scoped(() => new Boxed(2)));
      });

      expect(childScope.use(k1).value).toEqual(1);

      expect(c.use(k1)).toBe(childScope.use(k1));
    });

    it(`allows for overrides other than specified in final bindings`, async () => {
      const k1 = fn.scoped(() => Math.random());
      const k2 = fn.scoped(() => Math.random());

      const c = container.new(c => {
        c.freeze(k1).to(fn.scoped(() => 1));
      });

      expect(c.use(k1)).toEqual(1);

      const childScope = c.checkoutScope(scope => {
        scope.bindLocal(k2).to(fn.scoped(() => 2));
      });

      expect(childScope.use(k1)).toEqual(1);
      expect(childScope.use(k2)).toEqual(2);
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for scoped scope`, async () => {
      const a = fn.scoped(() => new BoxedValue(1));

      const c = container.new();

      expect(c.use(a).value).toEqual(1);

      const childC = c.checkoutScope(c => {
        c.bindLocal(a).to(fn.scoped(() => new BoxedValue(2)));
      });

      expect(childC.use(a).value).toEqual(2);
    });

    it(`new scope inherits parent scope overrides`, async () => {
      const a = fn.scoped(() => new BoxedValue(1));

      const root = container.new();
      expect(root.use(a).value).toEqual(1);

      const childC = root.checkoutScope(c => {
        c.bindLocal(a).to(fn.scoped(() => new BoxedValue(2)));
      });

      expect(childC.use(a).value).toEqual(2);

      const grandChildC = childC.checkoutScope();
      expect(grandChildC.use(a).value).toEqual(1);

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

        const childC = c.checkoutScope(c => {
          c.bindLocal(a).to(fn.scoped(() => 2));
        });

        expect(c.use(a)).toEqual(1);
        expect(childC.use(a)).toEqual(2);
      });
    });

    describe(`global overrides`, () => {
      it(`cannot be replaced by scope overrides`, async () => {
        const k1 = fn.scoped(() => Math.random());

        const c = container.new(c => {
          c.freeze(k1).to(fn.scoped(() => 1));
        });

        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope(c => {
          c.bindLocal(k1).to(fn.scoped(() => 2));
        });

        expect(childScope.use(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
        const k1 = fn.scoped(() => Math.random());
        const k2 = fn.scoped(() => Math.random());

        const c = container.new(c => {
          c.freeze(k1).to(fn.scoped(() => 1));
        });

        expect(c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope(c => {
          c.bindLocal(k2).to(fn.scoped(() => 2));
        });

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

        const childC = c.checkoutScope(c => {
          c.bindLocal(a).to(fn.scoped(async () => 2));
        });

        expect(await c.use(a)).toEqual(1);
        expect(await childC.use(a)).toEqual(2);
      });
    });

    describe(`global overrides`, () => {
      it(`cannot be replaced by scope overrides`, async () => {
        const k1 = fn.scoped(async () => Math.random());

        const c = container.new(c => {
          c.freeze(k1).to(fn.scoped(async () => 1));
        });

        expect(await c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope(c => {
          c.bindLocal(k1).to(fn.scoped(async () => 2));
        });
        expect(await childScope.use(k1)).toEqual(1);
      });

      it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
        const k1 = fn.scoped(async () => Math.random());
        const k2 = fn.scoped(async () => Math.random());

        const c = container.new(container => {
          container.freeze(k1).to(fn.scoped(async () => 1));
          container.freeze(k2).to(fn.scoped(async () => 2));
        });

        expect(await c.use(k1)).toEqual(1);

        const childScope = c.checkoutScope(c => {
          c.bindLocal(k2).to(fn.scoped(async () => 2));
        });
        expect(await childScope.use(k1)).toEqual(1);
        expect(await childScope.use(k2)).toEqual(2);
      });
    });
  });
});

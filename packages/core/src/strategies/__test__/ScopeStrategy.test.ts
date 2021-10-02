import { container } from '../../container/Container';
import { scoped } from '../../new/singletonStrategies';
import { BoxedValue } from '../../__test__/BoxedValue';
import { replace } from '../../new/instancePatching';

describe(`ScopeStrategy`, () => {
  describe(`resolution`, () => {
    it(`acts like singleton limited to given scope`, async () => {
      const a = scoped.fn(() => Math.random());

      const c = container();
      expect(c.__get(a)).toEqual(c.__get(a));

      const childScope = c.checkoutScope();
      expect(childScope.__get(a)).toEqual(childScope.__get(a));
      expect(c.__get(a)).not.toEqual(childScope.__get(a));
    });
  });

  describe(`global overrides`, () => {
    it(`cannot be replaced by scope overrides`, async () => {
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

      const c = container({ globalOverridesNew: [invariantPatch] });
      expect(c.__get(k1).value).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverridesNew: [childScopePatch] });
      expect(childScope.__get(k1).value).toEqual(1);

      expect(c.__get(k1)).toBe(childScope.__get(k1));
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

      const c = container({ globalOverridesNew: [invariantPatch] });
      expect(c.__get(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverridesNew: [childScopePatch] });
      expect(childScope.__get(k1)).toEqual(1);
      expect(childScope.__get(k2)).toEqual(2);
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for scoped scope`, async () => {
      const a = scoped.fn(() => new BoxedValue(1));

      const c = container();
      expect(c.__get(a).value).toEqual(1);

      const mPatch = replace(
        a,
        scoped.fn(() => new BoxedValue(2)),
      );
      const childC = c.checkoutScope({ scopeOverridesNew: [mPatch] });
      expect(childC.__get(a).value).toEqual(2);
    });

    it(`new scope inherits parent scope overrides`, async () => {
      const a = scoped.fn(() => new BoxedValue(1));

      const root = container();
      expect(root.__get(a).value).toEqual(1);

      const mPatch = replace(a, scoped.fn(() => new BoxedValue(2)));
      const childC = root.checkoutScope({ scopeOverridesNew: [mPatch] });
      expect(childC.__get(a).value).toEqual(2);

      const grandChildC = childC.checkoutScope();
      expect(grandChildC.__get(a).value).toEqual(2);

      expect(childC.__get(a)).not.toBe(grandChildC.__get(a));
    });
  });
});

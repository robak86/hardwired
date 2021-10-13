import { Container, container } from '../../../container/Container';
import { scoped } from '../../../definitions/definitions';
import { BoxedValue } from '../../../__test__/BoxedValue';
import { replace } from '../../../patching/replace';
import { ContainerContext } from '../../../context/ContainerContext';

describe(`ScopeStrategy`, () => {
  describe(`resolution`, () => {
    it(`acts like singleton limited to given scope`, async () => {
      const a = scoped.fn(() => Math.random());

      const c = ContainerContext.empty();
      expect(c.get(a)).toEqual(c.get(a));

      const childScope = c.checkoutScope();
      expect(childScope.get(a)).toEqual(childScope.get(a));
      expect(c.get(a)).not.toEqual(childScope.get(a));
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

      const c = ContainerContext.create([], [invariantPatch]);

      expect(c.get(k1).value).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.get(k1).value).toEqual(1);

      expect(c.get(k1)).toBe(childScope.get(k1));
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
      expect(c.get(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.get(k1)).toEqual(1);
      expect(childScope.get(k2)).toEqual(2);
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for scoped scope`, async () => {
      const a = scoped.fn(() => new BoxedValue(1));

      const c = ContainerContext.empty()
      expect(c.get(a).value).toEqual(1);

      const mPatch = replace(
        a,
        scoped.fn(() => new BoxedValue(2)),
      );
      const childC = c.checkoutScope({ scopeOverrides: [mPatch] });
      expect(childC.get(a).value).toEqual(2);
    });

    it(`new scope inherits parent scope overrides`, async () => {
      const a = scoped.fn(() => new BoxedValue(1));

      const root = ContainerContext.empty()
      expect(root.get(a).value).toEqual(1);

      const mPatch = replace(
        a,
        scoped.fn(() => new BoxedValue(2)),
      );
      const childC = root.checkoutScope({ scopeOverrides: [mPatch] });
      expect(childC.get(a).value).toEqual(2);

      const grandChildC = childC.checkoutScope();
      expect(grandChildC.get(a).value).toEqual(2);

      expect(childC.get(a)).not.toBe(grandChildC.get(a));
    });
  });
});

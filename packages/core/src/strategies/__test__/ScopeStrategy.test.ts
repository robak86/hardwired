import { module, unit } from '../../module/ModuleBuilder';
import { scoped } from '../ScopeStrategy';
import { container } from '../../container/Container';

describe(`ScopeStrategy`, () => {
  describe(`resolution`, () => {
    it(`acts like singleton limited to given scope`, async () => {
      const m = unit()
        .define('a', scoped, () => Math.random())
        .build();

      const c = container();
      expect(c.get(m, 'a')).toEqual(c.get(m, 'a'));

      const childScope = c.checkoutScope();
      expect(childScope.get(m, 'a')).toEqual(childScope.get(m, 'a'));
      expect(c.get(m, 'a')).not.toEqual(childScope.get(m, 'a'));
    });
  });

  describe(`global overrides`, () => {
    it(`cannot be replaced by scope overrides`, async () => {
      class Boxed {
        constructor(public value = Math.random()) {}
      }

      const m = module()
        .define('k1', scoped, () => new Boxed())
        .build();

      const invariantPatch = m.replace('k1', () => new Boxed(1), scoped);
      const childScopePatch = m.replace('k1', () => new Boxed(1), scoped);

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.asObject(m).k1.value).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.asObject(m).k1.value).toEqual(1);

      expect(c.asObject(m).k1).toBe(childScope.asObject(m).k1);
    });

    it(`allows for overrides other than specified in globalOverrides`, async () => {
      const m = module()
        .define('k1', scoped, () => Math.random())
        .define('k2', scoped, () => Math.random())
        .build();

      const invariantPatch = m.replace('k1', () => 1, scoped);
      const childScopePatch = m.replace('k2', () => 2, scoped);

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.asObject(m).k1).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.asObject(m).k1).toEqual(1);
      expect(childScope.asObject(m).k2).toEqual(2);
    });
  });
});

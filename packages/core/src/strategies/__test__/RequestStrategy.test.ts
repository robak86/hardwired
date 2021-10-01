import { module, unit } from '../../module/ModuleBuilder';
import { request } from '../RequestStrategyLegacy';
import { container } from '../../container/Container';

describe(`RequestStrategy`, () => {
  describe(`resolution`, () => {
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

        const childC = c.checkoutScope();
        const req2 = childC.asObject(m);

        expect(req1.a).not.toEqual(req2.a);
      });
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for request scope`, async () => {
      const m = unit()
        .define('a', request, () => 1)
        .build();
      const c = container();

      const mPatch = m.replace('a', () => 2, request);
      const childC = c.checkoutScope({ scopeOverrides: [mPatch] });

      expect(c.get(m, 'a')).toEqual(1);
      expect(childC.get(m, 'a')).toEqual(2);
    });
  });

  describe(`global overrides`, () => {
    it(`cannot be replaced by scope overrides`, async () => {
      const m = module()
        .define('k1', request, () => Math.random())
        .build();

      const invariantPatch = m.replace('k1', () => 1, request);
      const childScopePatch = m.replace('k1', () => 2, request);

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.asObject(m).k1).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.asObject(m).k1).toEqual(1);
    });

    it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
      const m = module()
        .define('k1', request, () => Math.random())
        .define('k2', request, () => Math.random())
        .build();

      const invariantPatch = m.replace('k1', () => 1, request);
      const childScopePatch = m.replace('k2', () => 2, request);

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.asObject(m).k1).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.asObject(m).k1).toEqual(1);
      expect(childScope.asObject(m).k2).toEqual(2);
    });
  });
});

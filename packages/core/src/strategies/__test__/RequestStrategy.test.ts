import { container } from '../../container/Container';
import { replace } from '../../new/instancePatching';
import { request } from '../../new/singletonStrategies';

describe(`RequestStrategy`, () => {
  describe(`resolution`, () => {
    describe(`get`, () => {
      it(`uses new request scope for each call`, async () => {
        const a = request.fn(() => Math.random());

        const c = container();
        const req1 = c.__get(a);
        const req2 = c.__get(a);

        expect(req1).not.toEqual(req2);
      });
    });

    describe(`asObject`, () => {
      it(`runs asObject each time with new request scope `, async () => {
        const a = request.fn(() => Math.random());

        const c = container();
        const req1 = c.__asObject({ a });
        const req2 = c.__asObject({ a });

        expect(req1.a).not.toEqual(req2.a);
      });
    });

    describe(`childScope`, () => {
      it(`does not inherit any values from parent scope`, async () => {
        const a = request.fn(() => Math.random());

        const c = container();
        const req1 = c.__get(a);

        const childC = c.checkoutScope();
        const req2 = childC.__get(a);

        expect(req1).not.toEqual(req2);
      });
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for request scope`, async () => {
      const a = request.fn(() => 1);

      const c = container();

      const mPatch = replace(
        a,
        request.fn(() => 2),
      );

      const childC = c.checkoutScope({ scopeOverridesNew: [mPatch] });

      expect(c.__get(a)).toEqual(1);
      expect(childC.__get(a)).toEqual(2);
    });
  });

  describe(`global overrides`, () => {
    it(`cannot be replaced by scope overrides`, async () => {
      const k1 = request.fn(() => Math.random());

      const invariantPatch = replace(
        k1,
        request.fn(() => 1),
      );
      const childScopePatch = replace(
        k1,
        request.fn(() => 2),
      );

      const c = container({ globalOverridesNew: [invariantPatch] });
      expect(c.__get(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverridesNew: [childScopePatch] });
      expect(childScope.__get(k1)).toEqual(1);
    });

    it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
      const k1 = request.fn(() => Math.random());
      const k2 = request.fn(() => Math.random());

      const invariantPatch = replace(
        k1,
        request.fn(() => 1),
      );
      const childScopePatch = replace(
        k2,
        request.fn(() => 2),
      );

      const c = container({ globalOverridesNew: [invariantPatch] });
      expect(c.__get(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverridesNew: [childScopePatch] });
      expect(childScope.__get(k1)).toEqual(1);
      expect(childScope.__get(k2)).toEqual(2);
    });
  });
});

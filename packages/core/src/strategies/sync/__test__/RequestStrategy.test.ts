import { container } from '../../../container/Container';
import { request } from '../../../definitions/definitions';
import { replace } from '../../../patching/replace';

describe(`RequestStrategy`, () => {
  describe(`resolution`, () => {
    describe(`get`, () => {
      it(`uses new request scope for each call`, async () => {
        const a = request.fn(() => Math.random());

        const c = container();
        const req1 = c.get(a);
        const req2 = c.get(a);

        expect(req1).not.toEqual(req2);
      });
    });

    describe(`asObject`, () => {
      it(`runs asObject each time with new request scope `, async () => {
        const a = request.fn(() => Math.random());

        const c = container();
        const req1 = c.get(a);
        const req2 = c.get(a);

        expect(req1).not.toEqual(req2);
      });
    });

    describe(`childScope`, () => {
      it(`does not inherit any values from parent scope`, async () => {
        const a = request.fn(() => Math.random());

        const c = container();
        const req1 = c.get(a);

        const childC = c.checkoutScope();
        const req2 = childC.get(a);

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

      const childC = c.checkoutScope({ scopeOverrides: [mPatch] });

      expect(c.get(a)).toEqual(1);
      expect(childC.get(a)).toEqual(2);
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

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.get(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.get(k1)).toEqual(1);
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

      const c = container({ globalOverrides: [invariantPatch] });
      expect(c.get(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(childScope.get(k1)).toEqual(1);
      expect(childScope.get(k2)).toEqual(2);
    });
  });
});

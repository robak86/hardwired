import { container } from '../../../container/Container';
import { request } from '../../../definitions/definitions';
import { replace } from '../../../patching/replace';

describe(`AsyncRequestStrategy`, () => {
  describe(`resolution`, () => {
    describe(`get`, () => {
      it(`uses new request scope for each call`, async () => {
        const a = request.asyncFn(async () => Math.random());

        const c = container();
        const req1 = await c.getAsync(a);
        const req2 = await c.getAsync(a);

        expect(req1).not.toEqual(req2);
      });
    });

    describe(`asObject`, () => {
      it(`runs asObject each time with new request scope `, async () => {
        const a = request.asyncFn(async () => Math.random());

        const c = container();
        const req1 = await c.getAsync(a);
        const req2 = await c.getAsync(a);

        expect(req1).not.toEqual(req2);
      });
    });

    describe(`childScope`, () => {
      it(`does not inherit any values from parent scope`, async () => {
        const a = request.asyncFn(async () => Math.random());

        const c = container();
        const req1 = await c.getAsync(a);

        const childC = c.checkoutScope();
        const req2 = childC.getAsync(a);

        expect(req1).not.toEqual(req2);
      });
    });
  });

  describe(`scope overrides`, () => {
    it(`replaces definitions for request scope`, async () => {
      const a = request.asyncFn(async () => 1);

      const c = container();

      const mPatch = replace(
        a,
        request.asyncFn(async () => 2),
      );

      const childC = c.checkoutScope({ scopeOverrides: [mPatch] });

      expect(await c.getAsync(a)).toEqual(1);
      expect(await childC.getAsync(a)).toEqual(2);
    });
  });

  describe(`global overrides`, () => {
    it(`cannot be replaced by scope overrides`, async () => {
      const k1 = request.asyncFn(async () => Math.random());

      const invariantPatch = replace(
        k1,
        request.asyncFn(async () => 1),
      );
      const childScopePatch = replace(
        k1,
        request.asyncFn(async () => 2),
      );

      const c = container({ globalOverrides: [invariantPatch] });
      expect(await c.getAsync(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(await childScope.getAsync(k1)).toEqual(1);
    });

    it(`allows for overrides for other keys than ones specified in global overrides`, async () => {
      const k1 = request.asyncFn(async () => Math.random());
      const k2 = request.asyncFn(async () => Math.random());

      const invariantPatch = replace(
        k1,
        request.asyncFn(async () => 1),
      );
      const childScopePatch = replace(
        k2,
        request.asyncFn(async () => 2),
      );

      const c = container({ globalOverrides: [invariantPatch] });
      expect(await c.getAsync(k1)).toEqual(1);

      const childScope = c.checkoutScope({ scopeOverrides: [childScopePatch] });
      expect(await childScope.getAsync(k1)).toEqual(1);
      expect(await childScope.getAsync(k2)).toEqual(2);
    });
  });
});

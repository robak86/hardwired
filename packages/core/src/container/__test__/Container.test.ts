import { scoped, singleton } from '../../definitions/definitions.js';
import { container } from '../Container.js';
import { replace } from '../../patching/replace.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { describe, expect, it } from 'vitest';
import { implicit } from '../../definitions/sync/implicit.js';
import { set } from '../../patching/set.js';

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const cDef = singleton(() => 'cValue');
      const c = container();
      const cValue = c.use(cDef);
      expect(cValue).toEqual('cValue');
    });
  });

  describe(`.replace`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const a = singleton(() => 1);

        const mPatch = replace(
          a,
          singleton(() => 2),
        );

        expect(container({ overrides: [mPatch] }).use(a)).toEqual(2);
      });

      it(`does not affect other definitions`, async () => {
        const a = singleton(() => 1);
        const b = singleton(() => 'b');

        const mPatch = replace(
          a,
          singleton(() => 2),
        );
        expect(container({ overrides: [mPatch] }).use(b)).toEqual('b');
      });
    });
  });

  describe(`overrides`, () => {
    it(`merges multiple modules patches originated from the same module`, async () => {
      const a = singleton(function a() {
        return 1;
      });

      const b = singleton(function b() {
        return 2;
      });

      const aPlusB = singleton(function sum({ use }) {
        return use(a) + use(b);
      });

      const aPatch = replace(
        a,
        singleton(function aReplace() {
          return 10;
        }),
      );

      const bPatch = replace(
        b,
        singleton(function bReplace() {
          return 20;
        }),
      );

      const c = container([aPatch, bPatch]);

      const actual = c.use(aPlusB);
      expect(actual).toEqual(30);
    });
  });

  describe(`getAll`, () => {
    it(`returns array of instances`, async () => {
      const a = scoped(() => 1);
      const b = scoped(() => 2);

      const c = container();
      const [aInstance, bInstance] = c.useAll(a, b);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });

    it(`allows using external params`, async () => {
      const extD = implicit<BoxedValue<number>>('ext');
      const multiplyBy2D = scoped(c => c.use(extD).value * 2);
      const divideBy2D = scoped(c => c.use(extD).value / 2);
      const [val1, val2] = container()
        .checkoutScope({ overrides: [set(extD, new BoxedValue(10))] })
        .useAll(multiplyBy2D, divideBy2D);
      expect(val1).toEqual(20);
      expect(val2).toEqual(5);
    });

    it(`allows using external params ex.2`, async () => {
      const extD = implicit<BoxedValue<number>>('ext');

      let count = 0;
      const scopeSharedValD = scoped(() => (count += 1));
      const multiplyBy2D = scoped(c => {
        return { result: c.use(extD).value * 2, shared: c.use(scopeSharedValD) };
      });
      const divideBy2D = scoped(c => {
        return { result: c.use(extD).value / 2, shared: c.use(scopeSharedValD) };
      });

      const [req1, req2] = container()
        .checkoutScope({ overrides: [set(extD, new BoxedValue(10))] })
        .useAll(multiplyBy2D, divideBy2D);
      expect(req1.result).toEqual(20);
      expect(req2.result).toEqual(5);

      expect(req1.shared).toEqual(req2.shared);
    });
  });

  describe(`getAllAsync`, () => {
    it(`returns array of instances`, async () => {
      const a = scoped(async () => 1);
      const b = scoped(async () => 2);

      const c = container();
      const [aInstance, bInstance] = await c.useAllAsync([a, b]);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });
  });

  describe(`sync definition returning promise`, () => {
    it(`properly resolves async definitions`, async () => {
      let counter = 0;

      const k1 = singleton(async () => (counter += 1));
      const k2 = singleton(async () => (counter += 1));
      const k3 = singleton(async ({ use }) => (await use(k1)) + (await use(k2)));

      const c = container();
      const k3Instance = c.use(k3);
      expect(await k3Instance).toEqual(3);
    });
  });

  describe(`.checkoutRequestScope`, () => {
    it(`returns clear request scope`, async () => {
      const scopedVal = scoped(() => new BoxedValue(Math.random()));

      const cnt = container();
      const reqCnt1 = cnt.checkoutScope();
      const reqCnt2 = cnt.checkoutScope();

      const result1 = reqCnt1.use(scopedVal);
      const result2 = reqCnt2.use(scopedVal);

      expect(result1).not.toBe(result2);
    });
  });
});

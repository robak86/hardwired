import { request, singleton } from '../../definitions/definitions';
import { container } from '../Container';
import { replace } from '../../patching/replace';
import { BoxedValue } from '../../__test__/BoxedValue';
import { external } from '../../definitions/sync/external';

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const cDef = singleton.fn(() => 'cValue');
      const c = container();
      const cValue = c.get(cDef);
      expect(cValue).toEqual('cValue');
    });
  });

  describe(`.replace`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const a = singleton.fn(() => 1);

        const mPatch = replace(
          a,
          singleton.fn(() => 2),
        );

        expect(container({ scopeOverrides: [mPatch] }).get(a)).toEqual(2);
      });

      it(`does not affect other definitions`, async () => {
        const a = singleton.fn(() => 1);
        const b = singleton.fn(() => 'b');

        const mPatch = replace(
          a,
          singleton.fn(() => 2),
        );
        expect(container({ scopeOverrides: [mPatch] }).get(b)).toEqual('b');
      });
    });
  });

  describe(`overrides`, () => {
    it(`merges multiple modules patches originated from the same module`, async () => {
      const a = singleton.fn(function a() {
        return 1;
      });

      const b = singleton.fn(function b() {
        return 2;
      });

      const aPlusB = singleton.fn(
        function sum(a, b) {
          return a + b;
        },
        a,
        b,
      );

      const aPatch = replace(
        a,
        singleton.fn(function aReplace() {
          return 10;
        }),
      );

      const bPatch = replace(
        b,
        singleton.fn(function bReplace() {
          return 20;
        }),
      );

      const c = container([aPatch, bPatch]);

      const actual = c.get(aPlusB);
      expect(actual).toEqual(30);
    });
  });

  describe(`getAll`, () => {
    it(`returns array of instances`, async () => {
      const a = request.fn(() => 1);
      const b = request.fn(() => 2);

      const c = container();
      const [aInstance, bInstance] = c.getAll([a, b]);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });

    it(`allows using external params`, async () => {
      const extD = external<BoxedValue<number>>();
      const multiplyBy2D = request.fn((val: BoxedValue<number>) => val.value * 2, extD);
      const divideBy2D = request.fn((val: BoxedValue<number>) => val.value / 2, extD);
      const [val1, val2] = container().getAll([multiplyBy2D, divideBy2D], new BoxedValue(10));
      expect(val1).toEqual(20);
      expect(val2).toEqual(5);
    });

    it(`allows using external params ex.2`, async () => {
      const extD = external<BoxedValue<number>>();

      let count = 0;
      const requestSharedValD = request.fn(() => count += 1);
      const multiplyBy2D = request.fn(
        (val: BoxedValue<number>, sharedVal: number) => ({ result: val.value * 2, shared: sharedVal }),
        extD,
        requestSharedValD,
      );
      const divideBy2D = request.fn(
        (val: BoxedValue<number>, sharedVal: number) => ({ result: val.value / 2, shared: sharedVal }),
        extD,
        requestSharedValD,
      );


      const [req1, req2] = container().getAll([multiplyBy2D, divideBy2D], new BoxedValue(10));
      expect(req1.result).toEqual(20);
      expect(req2.result).toEqual(5);

      expect(req1.shared).toEqual(req2.shared)
    });
  });

  describe(`getAllAsync`, () => {
    it(`returns array of instances`, async () => {
      const a = request.asyncFn(async () => 1);
      const b = request.asyncFn(async () => 2);

      const c = container();
      const [aInstance, bInstance] = await c.getAllAsync(a, b);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });
  });

  describe(`sync definition returning promise`, () => {
    it(`properly resolves async definitions`, async () => {
      let counter = 0;

      const k1 = singleton.fn(async () => (counter += 1));
      const k2 = singleton.fn(async () => (counter += 1));
      const k3 = singleton.fn(async (k1, k2) => (await k1) + (await k2), k1, k2);

      const c = container();
      const k3Instance = c.get(k3);
      expect(await k3Instance).toEqual(3);
    });
  });

  describe(`.checkoutRequestScope`, () => {
    it(`returns clear request scope`, async () => {
      const requestVal = request.fn(() => new BoxedValue(Math.random()));

      const cnt = container();
      const reqCnt1 = cnt.checkoutRequestScope();
      const reqCnt2 = cnt.checkoutRequestScope();

      const result1 = reqCnt1.get(requestVal);
      const result2 = reqCnt2.get(requestVal);

      expect(result1).not.toBe(result2);
    });
  });
});

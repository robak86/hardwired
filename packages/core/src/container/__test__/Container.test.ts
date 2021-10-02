import { replace } from '../../new/instancePatching';
import { request, singleton } from '../../new/singletonStrategies';
import { container } from '../Container';

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const cDef = singleton.fn(() => 'cValue');
      const c = container();

      const cValue = c.__get(cDef);
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

        expect(container({ scopeOverridesNew: [mPatch] }).__get(a)).toEqual(2);
      });

      it(`calls provided function with materialized module`, async () => {
        const a = singleton.fn(() => 1);
        const b = singleton.fn(() => 2);

        const factoryFunctionSpy = jest.fn().mockImplementation(ctx => {
          return () => 3;
        });

        const mPatch = replace(a, singleton.fn(factoryFunctionSpy));

        const testContainer = container({ scopeOverridesNew: [mPatch] });
        testContainer.__get(a);

        expect({ ...factoryFunctionSpy.mock.calls[0][0] }).toEqual({ ...testContainer.__asObject({ a, b }) });
      });

      it(`does not affect other definitions`, async () => {
        const a = singleton.fn(() => 1);
        const b = singleton.fn(() => 'b');

        const mPatch = replace(
          a,
          singleton.fn(() => 2),
        );
        expect(container({ scopeOverridesNew: [mPatch] }).__get(b)).toEqual('b');
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
        [a, b],
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

      const c = container({
        globalOverridesNew: [
          //breakme
          aPatch,
          bPatch,
        ],
      });

      const actual = c.__get(aPlusB);
      expect(actual).toEqual(30);
    });
  });

  describe(`asObjectMany`, () => {
    it(`returns array of materialized modules`, async () => {
      const a = request.fn(() => 1);
      const b = request.fn(() => 2);

      const c = container();
      const [aInstance, bInstance] = c.__getAll(a, b);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });
  });

  describe(`async definition`, () => {
    it(`properly resolves async definitions`, async () => {
      let counter = 0;

      const k1 = singleton.fn(async () => (counter += 1));
      const k2 = singleton.fn(async () => (counter += 1));
      const k3 = singleton.fn(async (k1, k2) => (await k1) + (await k2), [k1, k2]);

      const c = container();
      const k3Instance = c.__get(k3);
      expect(await k3Instance).toEqual(3);
    });

    it(`does not evaluated promise if key is not accessed`, async () => {
      // let counter = 0;
      // const k1Factory = jest.fn(async () => (counter += 1));
      // const k2Factory = jest.fn(async () => (counter += 1));
      // const k3Factory = jest.fn(async (k1, k2) => (await k1) + (await k2));
      //
      // const k1 = singleton.fn(k1Factory);
      // const k2 = singleton.fn(k2Factory);
      // const k3 = singleton.fn(k3Factory, [k1, k2]);
      //
      //
      // const c = container();
      // // const k1Instnace = c.asObject(u);
      // // const { k1: k1NextRequest } = c.asObject(u);
      // expect(k1Factory).toHaveBeenCalledTimes(1);
      // expect(k2Factory).not.toHaveBeenCalled();
      // expect(k3Factory).not.toHaveBeenCalled();
    });
  });
});

import { scoped, singleton } from '../../definitions/definitions.js';
import { container } from '../Container.js';
import { replace } from '../../patching/replace.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { describe, expect, it, vi } from 'vitest';
import { implicit } from '../../definitions/sync/implicit.js';
import { set } from '../../patching/set.js';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder.js';
import { ContainerInterceptor } from '../../context/ContainerInterceptor.js';

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
      const [aInstance, bInstance] = c.getAll([a, b]);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });

    it(`allows using external params`, async () => {
      const extD = implicit<BoxedValue<number>>('ext');
      const multiplyBy2D = scoped(c => c.use(extD).value * 2);
      const divideBy2D = scoped(c => c.use(extD).value / 2);
      const [val1, val2] = container()
        .checkoutScope({ overrides: [set(extD, new BoxedValue(10))] })
        .getAll([multiplyBy2D, divideBy2D]);
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
        .getAll([multiplyBy2D, divideBy2D]);
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
      const [aInstance, bInstance] = await c.getAllAsync([a, b]);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });
  });

  describe(`interceptors`, () => {
    describe(`interceptors for checkoutRequestScope`, () => {
      it(`does not inherit interceptors`, async () => {
        const def = singleton(() => 123);
        const interceptSyncSpy = vi.fn();
        const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } }).checkoutScope();
        ctn.use(def);
        expect(interceptSyncSpy).not.toBeCalled();
      });

      it(`does not call parent interceptors`, async () => {
        const def = singleton(() => 123);
        const interceptSyncParentSpy = vi.fn();
        const interceptSyncReqSpy = vi.fn();

        const ctn = container({ interceptor: { interceptSync: interceptSyncParentSpy } }).checkoutScope({
          interceptor: { interceptSync: interceptSyncReqSpy },
        });
        ctn.use(def);
        expect(interceptSyncParentSpy).not.toBeCalled();
        expect(interceptSyncReqSpy).toBeCalled();
      });
    });

    describe(`sync`, () => {
      describe(`no deps`, () => {
        it(`is called with created instance`, async () => {
          const def = singleton(() => 123);

          const interceptSyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } });
          ctn.use(def);
          expect(interceptSyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`is called only once preserving singleton strategy`, async () => {
          const def = singleton(() => 123);

          const interceptSyncSpy = vi.fn(val => val);
          const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } });
          ctn.use(def);
          ctn.use(def);
          expect(interceptSyncSpy).toHaveBeenCalledTimes(1);
        });

        it(`is called multiple times preserving request strategy`, async () => {
          const def = scoped(() => 123);

          const interceptSyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } });
          ctn.use(def);
          ctn.use(def);
          expect(interceptSyncSpy).toHaveBeenCalledTimes(2);
        });

        it(`returns intercepted value`, async () => {
          const def = singleton(() => 123);

          const interceptSyncSpy = vi.fn(
            <T>(def: InstanceDefinition<T, any, any>, ctx: InstancesBuilder): T => 456 as T,
          );

          const interceptor = { interceptSync: interceptSyncSpy } as ContainerInterceptor;
          const ctn = container({ interceptor });

          expect(ctn.use(def)).toEqual(456);
        });
      });
    });
    describe(`async`, () => {
      describe(`no deps`, () => {
        it(`is called with created instance`, async () => {
          const def = singleton(async () => 123);

          const interceptAsyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptAsync: interceptAsyncSpy } });
          await ctn.use(def);
          expect(interceptAsyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`works with sync factory`, async () => {
          const def = singleton(() => 123);

          const interceptAsyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptAsync: interceptAsyncSpy } });
          await ctn.use(def);
          expect(interceptAsyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`returns intercepted value`, async () => {
          const def = singleton(() => 123);

          const interceptAsyncSpy = vi.fn(
            async <T>(def: InstanceDefinition<T, any, any>, ctx: ContainerContext): Promise<T> => 456 as T,
          );

          const interceptor = { interceptAsync: interceptAsyncSpy } as ContainerInterceptor;
          const ctn = container({ interceptor });

          expect(await ctn.use(def)).toEqual(456);
        });
      });

      describe(`with deps`, () => {
        it(`it calls interceptor on dependency definition`, async () => {
          const def1 = singleton(async () => 123);
          const def2 = singleton(async ({ use }) => (await use(def1)) + 1000);

          const interceptAsyncSpy = vi.fn(
            async <T>(def: InstanceDefinition<T, any, any>, ctx: ContainerContext): Promise<T> => {
              return def.create(ctx);
            },
          );

          const interceptor = { interceptAsync: interceptAsyncSpy } as ContainerInterceptor;
          const ctn = container({ interceptor });

          await ctn.use(def2);
          expect(interceptAsyncSpy).toHaveBeenCalledTimes(2);

          expect(interceptAsyncSpy.mock.calls[0]).toEqual([def2, expect.any(ContainerContext)]);
          expect(interceptAsyncSpy.mock.calls[1]).toEqual([def1, expect.any(ContainerContext)]);
        });
      });
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

import { fn, scoped, singleton } from '../../definitions/definitions.js';
import { container } from '../Container.js';
import { replace } from '../../patching/replace.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { describe, expect, it, vi } from 'vitest';
import { implicit } from '../../definitions/sync/implicit.js';
import { set } from '../../patching/set.js';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';
import { ContainerContext } from '../../context/ContainerContext.js';
import { AsyncInstanceDefinition } from '../../definitions/abstract/async/AsyncInstanceDefinition.js';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder.js';
import { ContainerInterceptor } from '../../context/ContainerInterceptor.js';
import { patch } from '../Assignments.js';

describe(`Container`, () => {
  describe(`acts like a function`, () => {
    it(`is callable like function`, async () => {
      const use = container();
      const myDef = fn.singleton(() => 123);

      const instance = use(myDef);
      expect(instance).toEqual(123);
    });

    it(`works with destructuring`, async () => {
      const use = container();
      const someValue = fn.singleton(() => 1000);
      const myDef = fn.singleton(({ use }) => {
        return use(someValue) + 123;
      });

      const instance = use(myDef);
      expect(instance).toEqual(1123);
    });

    describe(`other methods`, () => {
      it(`provides use method`, async () => {
        const use = container();

        const myDef1 = fn.singleton(() => 123);

        const val1 = use.use(myDef1);
        expect(val1).toEqual(123);
      });

      it(`provides all method for creating multiple instances`, async () => {
        const use = container();

        const myDef1 = fn.singleton(() => 123);
        const myDef2 = fn.singleton(() => 456);

        const [val1, val2] = use.all(myDef1, myDef2);

        expect(val1).toEqual(123);
        expect(val2).toEqual(456);
      });

      it(`provides withScope method`, async () => {
        const use = container();
        const myDef = fn.scoped(() => Math.random());
        const consumer = fn.singleton(use => {
          return [use.withScope(use => use(myDef)), use.withScope(use => use(myDef))];
        });

        const [val1, val2] = use(consumer);
        expect(val1).not.toBe(val2);
      });
    });
  });

  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const cDef = singleton.fn(() => 'cValue');
      const c = container();
      const cValue = c.use(cDef);
      expect(cValue).toEqual('cValue');
    });
  });

  describe(`.replace`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const a = fn.singleton(() => 1);
        const overrides = patch().set(a, 2);

        expect(container({ overrides }).use(a)).toEqual(2);
      });

      it(`does not affect other definitions`, async () => {
        const a = fn.singleton(() => 1);
        const b = fn.singleton(() => 'b');

        const mPatch = a.patch().replace(fn.singleton(() => 2));

        expect(container({ overrides: [mPatch] }).use(b)).toEqual('b');
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

      const aPlusB = singleton.using(a, b).fn(function sum(a, b) {
        return a + b;
      });

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

      const actual = c.use(aPlusB);
      expect(actual).toEqual(30);
    });
  });

  describe(`getAll`, () => {
    it(`returns array of instances`, async () => {
      const a = scoped.fn(() => 1);
      const b = scoped.fn(() => 2);

      const c = container();
      const [aInstance, bInstance] = c.all(a, b);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });

    it(`allows using external params`, async () => {
      const extD = implicit<BoxedValue<number>>('ext');
      const multiplyBy2D = scoped.using(extD).fn((val: BoxedValue<number>) => val.value * 2);
      const divideBy2D = scoped.using(extD).fn((val: BoxedValue<number>) => val.value / 2);
      const [val1, val2] = container()
        .checkoutScope({ overrides: [set(extD, new BoxedValue(10))] })
        .all(multiplyBy2D, divideBy2D);
      expect(val1).toEqual(20);
      expect(val2).toEqual(5);
    });

    it(`allows using external params ex.2`, async () => {
      const extD = implicit<BoxedValue<number>>('ext');

      let count = 0;
      const scopeSharedValD = scoped.fn(() => (count += 1));
      const multiplyBy2D = scoped
        .using(extD, scopeSharedValD)
        .fn((val: BoxedValue<number>, sharedVal: number) => ({ result: val.value * 2, shared: sharedVal }));
      const divideBy2D = scoped
        .using(extD, scopeSharedValD)
        .fn((val: BoxedValue<number>, sharedVal: number) => ({ result: val.value / 2, shared: sharedVal }));

      const [req1, req2] = container()
        .checkoutScope({ overrides: [set(extD, new BoxedValue(10))] })
        .all(multiplyBy2D, divideBy2D);
      expect(req1.result).toEqual(20);
      expect(req2.result).toEqual(5);

      expect(req1.shared).toEqual(req2.shared);
    });
  });

  describe(`getAllAsync`, () => {
    it(`returns array of instances`, async () => {
      const a = scoped.async().fn(async () => 1);
      const b = scoped.async().fn(async () => 2);

      const c = container();
      const [aInstance, bInstance] = await c.allAsync(a, b);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });
  });

  describe(`interceptors`, () => {
    describe(`interceptors for checkoutRequestScope`, () => {
      it(`does not inherit interceptors`, async () => {
        const def = singleton.fn(() => 123);
        const interceptSyncSpy = vi.fn();
        const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } }).checkoutScope();
        ctn.use(def);
        expect(interceptSyncSpy).not.toBeCalled();
      });

      it(`does not call parent interceptors`, async () => {
        const def = singleton.fn(() => 123);
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
          const def = singleton.fn(() => 123);

          const interceptSyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } });
          ctn.use(def);
          expect(interceptSyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`is called only once preserving singleton strategy`, async () => {
          const def = singleton.fn(() => 123);

          const interceptSyncSpy = vi.fn(val => val);
          const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } });
          ctn.use(def);
          ctn.use(def);
          expect(interceptSyncSpy).toHaveBeenCalledTimes(1);
        });

        it(`is called multiple times preserving request strategy`, async () => {
          const def = scoped.fn(() => 123);

          const interceptSyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } });
          ctn.use(def);
          ctn.use(def);
          expect(interceptSyncSpy).toHaveBeenCalledTimes(2);
        });

        it(`returns intercepted value`, async () => {
          const def = singleton.fn(() => 123);

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
          const def = singleton.async().fn(async () => 123);

          const interceptAsyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptAsync: interceptAsyncSpy } });
          await ctn.use(def);
          expect(interceptAsyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`works with sync factory`, async () => {
          const def = singleton.async().fn(() => 123);

          const interceptAsyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptAsync: interceptAsyncSpy } });
          await ctn.use(def);
          expect(interceptAsyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`returns intercepted value`, async () => {
          const def = singleton.async().fn(() => 123);

          const interceptAsyncSpy = vi.fn(
            async <T>(def: AsyncInstanceDefinition<T, any, any>, ctx: ContainerContext): Promise<T> => 456 as T,
          );

          const interceptor = { interceptAsync: interceptAsyncSpy } as ContainerInterceptor;
          const ctn = container({ interceptor });

          expect(await ctn.use(def)).toEqual(456);
        });
      });

      describe(`with deps`, () => {
        it(`it calls interceptor on dependency definition`, async () => {
          const def1 = singleton.async().fn(async () => 123);
          const def2 = singleton
            .async()
            .using(def1)
            .fn(async (n1: number) => n1 + 1000);

          const interceptAsyncSpy = vi.fn(
            async <T>(def: AsyncInstanceDefinition<T, any, any>, ctx: ContainerContext): Promise<T> => {
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

      const k1 = singleton.fn(async () => (counter += 1));
      const k2 = singleton.fn(async () => (counter += 1));
      const k3 = singleton.using(k1, k2).fn(async (k1, k2) => (await k1) + (await k2));

      const c = container();
      const k3Instance = c.use(k3);
      expect(await k3Instance).toEqual(3);
    });
  });

  describe(`.checkoutRequestScope`, () => {
    it(`returns clear request scope`, async () => {
      const scopedVal = scoped.fn(() => new BoxedValue(Math.random()));

      const cnt = container();
      const reqCnt1 = cnt.checkoutScope();
      const reqCnt2 = cnt.checkoutScope();

      const result1 = reqCnt1.use(scopedVal);
      const result2 = reqCnt2.use(scopedVal);

      expect(result1).not.toBe(result2);
    });
  });
});

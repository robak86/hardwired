import { scoped, singleton } from '../../definitions/definitions.js';
import { container } from '../Container.js';
import { replace } from '../../patching/replace.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { implicit } from '../../definitions/sync/implicit.js';
import { set } from '../../patching/set.js';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';
import { ContainerContext, ContainerInterceptor } from '../../context/ContainerContext.js';
import { AsyncInstanceDefinition } from '../../definitions/abstract/async/AsyncInstanceDefinition.js';
import { InstancesBuilder } from '../../context/abstract/InstancesBuilder.js';
import { getEagerDefinitions } from '../../context/EagerDefinitions.js';
import { DefinitionBuilder } from '../../builder/DefinitionBuilder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import EventEmitter from 'node:events';

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

        expect(container({ overrides: [mPatch] }).get(a)).toEqual(2);
      });

      it(`does not affect other definitions`, async () => {
        const a = singleton.fn(() => 1);
        const b = singleton.fn(() => 'b');

        const mPatch = replace(
          a,
          singleton.fn(() => 2),
        );
        expect(container({ overrides: [mPatch] }).get(b)).toEqual('b');
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
      const a = scoped.fn(() => 1);
      const b = scoped.fn(() => 2);

      const c = container();
      const [aInstance, bInstance] = c.getAll([a, b]);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });

    it(`allows using external params`, async () => {
      const extD = implicit<BoxedValue<number>>('ext');
      const multiplyBy2D = scoped.fn((val: BoxedValue<number>) => val.value * 2, extD);
      const divideBy2D = scoped.fn((val: BoxedValue<number>) => val.value / 2, extD);
      const [val1, val2] = container()
        .checkoutScope({ overrides: [set(extD, new BoxedValue(10))] })
        .getAll([multiplyBy2D, divideBy2D]);
      expect(val1).toEqual(20);
      expect(val2).toEqual(5);
    });

    it(`allows using external params ex.2`, async () => {
      const extD = implicit<BoxedValue<number>>('ext');

      let count = 0;
      const scopeSharedValD = scoped.fn(() => (count += 1));
      const multiplyBy2D = scoped.fn(
        (val: BoxedValue<number>, sharedVal: number) => ({ result: val.value * 2, shared: sharedVal }),
        extD,
        scopeSharedValD,
      );
      const divideBy2D = scoped.fn(
        (val: BoxedValue<number>, sharedVal: number) => ({ result: val.value / 2, shared: sharedVal }),
        extD,
        scopeSharedValD,
      );

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
      const a = scoped.asyncFn(async () => 1);
      const b = scoped.asyncFn(async () => 2);

      const c = container();
      const [aInstance, bInstance] = await c.getAllAsync([a, b]);
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
        ctn.get(def);
        expect(interceptSyncSpy).not.toBeCalled();
      });

      it(`does not call parent interceptors`, async () => {
        const def = singleton.fn(() => 123);
        const interceptSyncParentSpy = vi.fn();
        const interceptSyncReqSpy = vi.fn();

        const ctn = container({ interceptor: { interceptSync: interceptSyncParentSpy } }).checkoutScope({
          interceptor: { interceptSync: interceptSyncReqSpy },
        });
        ctn.get(def);
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
          ctn.get(def);
          expect(interceptSyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`is called only once preserving singleton strategy`, async () => {
          const def = singleton.fn(() => 123);

          const interceptSyncSpy = vi.fn(val => val);
          const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } });
          ctn.get(def);
          ctn.get(def);
          expect(interceptSyncSpy).toHaveBeenCalledTimes(1);
        });

        it(`is called multiple times preserving request strategy`, async () => {
          const def = scoped.fn(() => 123);

          const interceptSyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptSync: interceptSyncSpy } });
          ctn.get(def);
          ctn.get(def);
          expect(interceptSyncSpy).toHaveBeenCalledTimes(2);
        });

        it(`returns intercepted value`, async () => {
          const def = singleton.fn(() => 123);

          const interceptSyncSpy = vi.fn(<T>(def: InstanceDefinition<T, any>, ctx: InstancesBuilder): T => 456 as T);

          const interceptor = { interceptSync: interceptSyncSpy } as ContainerInterceptor;
          const ctn = container({ interceptor });

          expect(ctn.get(def)).toEqual(456);
        });
      });
    });
    describe(`async`, () => {
      describe(`no deps`, () => {
        it(`is called with created instance`, async () => {
          const def = singleton.asyncFn(async () => 123);

          const interceptAsyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptAsync: interceptAsyncSpy } });
          await ctn.get(def);
          expect(interceptAsyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`works with sync factory`, async () => {
          const def = singleton.asyncFn(() => 123);

          const interceptAsyncSpy = vi.fn();
          const ctn = container({ interceptor: { interceptAsync: interceptAsyncSpy } });
          await ctn.get(def);
          expect(interceptAsyncSpy).toBeCalledWith(def, expect.any(ContainerContext));
        });

        it(`returns intercepted value`, async () => {
          const def = singleton.asyncFn(() => 123);

          const interceptAsyncSpy = vi.fn(
            async <T>(def: AsyncInstanceDefinition<T, any>, ctx: ContainerContext): Promise<T> => 456 as T,
          );

          const interceptor = { interceptAsync: interceptAsyncSpy } as ContainerInterceptor;
          const ctn = container({ interceptor });

          expect(await ctn.get(def)).toEqual(456);
        });
      });

      describe(`with deps`, () => {
        it(`it calls interceptor on dependency definition`, async () => {
          const def1 = singleton.asyncFn(async () => 123);
          const def2 = singleton.asyncFn(async (n1: number) => n1 + 1000, def1);

          const interceptAsyncSpy = vi.fn(
            async <T>(def: AsyncInstanceDefinition<T, any>, ctx: ContainerContext): Promise<T> => {
              return def.create(ctx);
            },
          );

          const interceptor = { interceptAsync: interceptAsyncSpy } as ContainerInterceptor;
          const ctn = container({ interceptor });

          await ctn.get(def2);
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
      const k3 = singleton.fn(async (k1, k2) => (await k1) + (await k2), k1, k2);

      const c = container();
      const k3Instance = c.get(k3);
      expect(await k3Instance).toEqual(3);
    });
  });

  describe(`.checkoutRequestScope`, () => {
    it(`returns clear request scope`, async () => {
      const scopedVal = scoped.fn(() => new BoxedValue(Math.random()));

      const cnt = container();
      const reqCnt1 = cnt.checkoutScope();
      const reqCnt2 = cnt.checkoutScope();

      const result1 = reqCnt1.get(scopedVal);
      const result2 = reqCnt2.get(scopedVal);

      expect(result1).not.toBe(result2);
    });
  });

  describe(`eager instantiation`, () => {
    const singleton = new DefinitionBuilder<[], LifeTime.singleton>([], LifeTime.singleton, false);

    beforeEach(() => {
      getEagerDefinitions().clear();
    });

    it(`doesn't creates eager definitions on container creation`, async () => {
      const factory = vi.fn(() => Math.random());
      const myDef = singleton.eager().fn(factory);

      container();
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it(`creates eager definitions on referencing dependency creation`, async () => {
      let valueAssigned = 0;

      const factory = vi.fn(async () => {
        valueAssigned = Math.random();
        return valueAssigned;
      });
      const myDef = singleton.eager().async().fn(factory);

      const consumer = singleton
        .async()
        .using(myDef)
        .fn(async val => {
          return val;
        });

      const cnt = container();

      const val = await cnt.get(myDef);
      const consumerVal = await cnt.get(consumer);

      expect(factory).toHaveBeenCalledTimes(1);
      expect(val).toEqual(consumerVal);
      expect(valueAssigned).toEqual(val);
    });

    it(`creates eager definitions when dependency of eager definition is requested`, () => {
      const eventEmitterD = singleton.fn(() => {
        console.log('create:eventEmitterD');
        return new EventEmitter<{ onMessage: [number] }>();
      });

      const consumer1D = singleton
        .using(eventEmitterD)
        .eager()
        .fn(val => {
          console.log('create:consumer1D');
          const messages: number[] = [];
          val.on('onMessage', value => messages.push(value));
          return messages;
        });

      const consumer2D = singleton
        .using(eventEmitterD)
        .eager()
        .fn(val => {
          console.log('create:consumer2D');
          const messages: number[] = [];
          val.on('onMessage', value => messages.push(value));
          return messages;
        });

      const producerD = singleton //
        .using(eventEmitterD)
        .fn(emitter => {
          console.log('create:producerD');
          return () => {
            return emitter.emit('onMessage', Math.random());
          };
        });

      const cnt = container();

      const producer = cnt.get(producerD);
      producer();
      producer();

      const consumer1 = cnt.get(consumer1D);
      const consumer2 = cnt.get(consumer2D);

      expect(consumer1.length).toEqual(2);
      expect(consumer2.length).toEqual(2);

      expect(consumer1).toEqual(consumer2);
    });
  });
});

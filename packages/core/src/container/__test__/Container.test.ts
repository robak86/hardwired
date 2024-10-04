import { fn } from '../../definitions/definitions.js';
import { container, once } from '../Container.js';

import { BoxedValue } from '../../__test__/BoxedValue.js';
import { describe, expect, it } from 'vitest';
import { unbound } from '../../definitions/sync/unbound.js';
import { expectType, TypeEqual } from 'ts-expect';

describe(`Container`, () => {
  describe(`acts like a function`, () => {
    it(`is callable like function`, async () => {
      const use = container.new();
      const myDef = fn.singleton(() => 123);

      const instance = use(myDef);
      expect(instance).toEqual(123);
    });

    it(`works with destructuring`, async () => {
      const use = container.new();
      const someValue = fn.singleton(() => 1000);
      const myDef = fn.singleton(({ use }) => {
        return use(someValue) + 123;
      });

      const instance = use(myDef);
      expect(instance).toEqual(1123);
    });

    describe(`additional arguments`, () => {
      it(`accepts other arguments for transient definition and works with ad-hoc resolution`, async () => {
        const def = fn((use, userId: number) => {
          return userId;
        });
        const value = once(def, 123);
        expect(value).toEqual(123);
      });

      it(`works with container resolution`, async () => {
        const def = fn((use, userId: number) => {
          return userId;
        });

        const value = container.new().use(def, 123);
        expect(value).toEqual(123);
      });

      it(`works with locator resolution`, async () => {
        const def = fn((use, userId: number) => {
          return userId;
        });

        const consumer = fn((use, userId) => {
          return use(def, userId);
        });

        const value = container.new().use(consumer, 456);
        expect(value).toEqual(456);
      });

      it(`works with deferred`, async () => {
        const removeUser = fn((use, userId: number) => {
          return userId;
        });

        const remove = container.new().defer(removeUser);
        expect(remove).toBeInstanceOf(Function);

        expect(remove(123)).toEqual(123);
      });

      it(`allows passing arguments only to the transient definition`, async () => {
        // @ts-expect-error
        fn.singleton((use, userId: number) => userId);

        // @ts-expect-error
        fn.scoped((use, userId: number) => userId);
      });
    });

    describe(`other methods`, () => {
      it(`provides use method`, async () => {
        const use = container.new();

        const myDef1 = fn.singleton(() => 123);

        const val1 = use.use(myDef1);
        expect(val1).toEqual(123);
      });

      describe(`all`, () => {
        it(`returns correct instances`, async () => {
          const use = container.new();

          const myDef1 = fn.singleton(() => 123);
          const myDef2 = fn.singleton(() => 456);

          const [val1, val2] = use.all(myDef1, myDef2);

          expect(val1).toEqual(123);
          expect(val2).toEqual(456);
        });

        it(`returns correct type for async instances`, async () => {
          const use = container.new();

          const myDef1 = fn.singleton(() => 123);
          const myDef2 = fn.singleton(async () => 456);

          const result = use.all(myDef1, myDef2);

          expectType<TypeEqual<typeof result, Promise<[number, number]>>>(true);
        });
      });

      describe(`object`, () => {
        it(`returns correct instances`, async () => {
          const use = container.new();

          const myDef1 = fn.singleton(() => 123);
          const myDef2 = fn.singleton(() => 456);

          const result = use.object({ myDef1, myDef2 });

          expect(result.myDef1).toEqual(123);
          expect(result.myDef2).toEqual(456);
        });

        describe(`async resolution`, () => {
          it(`doesn't crash on empty object`, async () => {
            const use = container.new();
            const result = await use.object({});

            expect(result).toEqual({});
            expect(Object.keys(result)).toHaveLength(0);
          });

          it(`returns correct instance for a single key`, async () => {
            const use = container.new();
            const myDef2 = fn.singleton(async () => 456);
            const result = await use.object({ myDef2 });

            expect(result.myDef2).toEqual(456);
          });

          it(`returns correct instance for two keys`, async () => {
            const use = container.new();

            const myDef1 = fn.singleton(() => 123);
            const myDef2 = fn.singleton(async () => 456);

            const result = await use.object({ myDef1, myDef2 });

            expect(result.myDef1).toEqual(123);
            expect(result.myDef2).toEqual(456);
          });

          it(`returns correct instance for more keys`, async () => {
            const use = container.new();

            const myDef1 = fn.singleton(async () => 123);
            const myDef2 = fn.singleton(async () => 456);
            const myDef3 = fn.singleton(async () => 789);

            const result = await use.object({ myDef1, myDef2, myDef3 });

            expect(result.myDef1).toEqual(123);
            expect(result.myDef2).toEqual(456);
            expect(result.myDef3).toEqual(789);
          });
        });

        it(`returns correct type for async instances`, async () => {
          const use = container.new();

          const myDef1 = fn.singleton(() => 123);
          const myDef2 = fn.singleton(async () => 456);

          const result = use.object({ myDef1, myDef2 });

          expectType<TypeEqual<typeof result, Promise<{ myDef1: number; myDef2: number }>>>(true);
        });
      });

      it(`provides withScope method`, async () => {
        const use = container.new();
        const myDef = fn.scoped(() => Math.random());
        const consumer = fn.scoped(use => {
          return [use.withScope(use => use(myDef)), use.withScope(use => use(myDef))];
        });

        const [val1, val2] = use(consumer);
        expect(val1).not.toBe(val2);
      });
    });
  });

  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const cDef = fn.singleton(() => 'cValue');
      const c = container.new();
      const cValue = c.use(cDef);
      expect(cValue).toEqual('cValue');
    });
  });

  describe(`.replace`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const a = fn.scoped(() => 1);

        const cnt = container.new(c => {
          c.bindLocal(a).toValue(2);
        });

        expect(cnt.use(a)).toEqual(2);
      });

      it(`does not affect other definitions`, async () => {
        const a = fn.scoped(() => 1);
        const b = fn.scoped(() => 'b');

        const cnt = container.new(c => {
          c.bindLocal(a).to(fn.scoped(() => 2));
        });

        expect(cnt.use(b)).toEqual('b');
      });
    });
  });

  describe(`bindings`, () => {
    it(`merges multiple modules patches originated from the same module`, async () => {
      const a = fn.singleton(function a() {
        return 1;
      });

      const b = fn.singleton(function b() {
        return 2;
      });

      const aPlusB = fn.singleton(function sum(use) {
        return use(a) + use(b);
      });

      const c = container.new(c => {
        c.freeze(a).to(fn.singleton(() => 10));
        c.freeze(b).to(fn.singleton(() => 20));
      });

      const actual = c.use(aPlusB);
      expect(actual).toEqual(30);
    });
  });

  describe(`getAll`, () => {
    it(`returns array of instances`, async () => {
      const a = fn.scoped(() => 1);
      const b = fn.scoped(() => 2);

      const c = container.new();
      const [aInstance, bInstance] = c.all(a, b);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });

    it(`allows using external params`, async () => {
      const extD = unbound<BoxedValue<number>>();

      const multiplyBy2D = fn.scoped(use => use(extD).value * 2);
      const divideBy2D = fn.scoped(use => use(extD).value / 2);

      const [val1, val2] = container
        .new()
        .scope(c => {
          c.bindLocal(extD).toValue(new BoxedValue(10));
        })
        .all(multiplyBy2D, divideBy2D);

      expect(val1).toEqual(20);
      expect(val2).toEqual(5);
    });

    it(`allows using external params ex.2`, async () => {
      const extD = unbound<BoxedValue<number>>();

      let count = 0;
      const scopeSharedValD = fn.scoped(() => (count += 1));

      const multiplyBy2D = fn.scoped(use => {
        const val = use(extD);
        const sharedVal = use(scopeSharedValD);
        return { result: val.value * 2, shared: sharedVal };
      });

      const divideBy2D = fn.scoped(use => {
        const val = use(extD);
        const sharedVal = use(scopeSharedValD);
        return { result: val.value / 2, shared: sharedVal };
      });

      const [req1, req2] = container
        .new()
        .scope(c => {
          c.bindLocal(extD).toValue(new BoxedValue(10));
        })
        .all(multiplyBy2D, divideBy2D);
      expect(req1.result).toEqual(20);
      expect(req2.result).toEqual(5);

      expect(req1.shared).toEqual(req2.shared);
    });
  });

  describe(`getAllAsync`, () => {
    it(`returns array of instances`, async () => {
      const a = fn.scoped(async () => 1);
      const b = fn.scoped(async () => 2);

      const c = container.new();
      const [aInstance, bInstance] = await c.all(a, b);
      expect(aInstance).toEqual(1);
      expect(bInstance).toEqual(2);
    });
  });

  describe(`sync definition returning promise`, () => {
    it(`properly resolves async definitions`, async () => {
      let counter = 0;

      const k1 = fn.singleton(async () => (counter += 1));
      const k2 = fn.singleton(async () => (counter += 1));

      const k3 = fn.singleton(async use => {
        return (await use(k1)) + (await use(k2));
      });

      const c = container.new();
      const k3Instance = c.use(k3);
      expect(await k3Instance).toEqual(3);
    });
  });

  describe(`.scope`, () => {
    it(`returns clear request scope`, async () => {
      const scopedVal = fn.scoped(() => new BoxedValue(Math.random()));

      const cnt = container.new();
      const reqCnt1 = cnt.scope();
      const reqCnt2 = cnt.scope();

      const result1 = reqCnt1.use(scopedVal);
      const result2 = reqCnt2.use(scopedVal);

      expect(result1).not.toBe(result2);
    });
  });
});

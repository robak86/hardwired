import { singleton } from '../factory/strategies';
import { container } from '../../container/Container';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { BoxedValue } from '../../__test__/BoxedValue';
import { replace } from "../../patching/replace";

// TODO: async resolution has race condition.
//  async strategies should immediately register dependency in instances cache (PushPromise) so it will be immediatelly available for other definitions
//  when strategy resolves its async instance it should push the value to pushpromise, which already may be consumed by other definitions

const resolveAfter = <T>(timeout: number, value: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, timeout);
  });
};

describe(`AsyncSingletonStrategy`, () => {
  describe(`class`, () => {
    describe(`no dependencies`, () => {
      it(`returns correct value`, async () => {
        class NoArgsCls {
          value = Math.random();
        }

        const asyncDef = singleton.asyncClass(NoArgsCls);
        const result = await container().getAsync(asyncDef);
        expect(result).toBeInstanceOf(NoArgsCls);
      });
    });

    describe(`dependencies`, () => {
      it(`returns correct value, ex.1`, async () => {
        const asyncDep = singleton.asyncFn(async () => 123);
        const syncDep = singleton.fn(() => 'str');
        const asyncDef = singleton.asyncClass(TestClassArgs2, asyncDep, syncDep);
        const result = await container().getAsync(asyncDef);
        expect(result.someString).toEqual('str');
        expect(result.someNumber).toEqual(123);
      });

      it(`returns correct value, ex.2`, async () => {
        const asyncDep = singleton.asyncFn(async () => 123);
        const syncDep = singleton.asyncFn(async () => 'str');
        const asyncDef = singleton.asyncClass(TestClassArgs2, asyncDep, syncDep);
        const result = await container().getAsync(asyncDef);
        expect(result.someString).toEqual('str');
        expect(result.someNumber).toEqual(123);
      });

      it(`returns correct value, ex.2`, async () => {
        const asyncDep = singleton.fn(() => 123);
        const syncDep = singleton.fn(() => 'str');
        const asyncDef = singleton.asyncClass(TestClassArgs2, asyncDep, syncDep);
        const result = await container().getAsync(asyncDef);
        expect(result.someString).toEqual('str');
        expect(result.someNumber).toEqual(123);
      });
    });
  });

  describe(`fn`, () => {
    describe(`no dependencies`, () => {
      it(`returns correct value`, async () => {
        const asyncDef = singleton.asyncFn(async () => 123);
        const result = await container().getAsync(asyncDef);
        expect(result).toEqual(123);
      });
    });

    describe(`dependencies`, () => {
      describe(`mixed async and sync dependencies`, () => {
        it(`returns correct value`, async () => {
          const asyncDep = singleton.asyncFn(async () => 123);
          const syncDep = singleton.fn(() => 'str');

          const asyncDef = singleton.asyncFn(async (a: number, b: string) => [a, b], asyncDep, syncDep);
          const result = await container().getAsync(asyncDef);
          expect(result).toEqual([123, 'str']);
        });
      });

      describe(`only async dependencies`, () => {
        it(`returns correct value`, async () => {
          const asyncDep = singleton.asyncFn(async () => 123);
          const syncDep = singleton.asyncFn(async () => 'str');

          const asyncDef = singleton.asyncFn(async (a: number, b: string) => [a, b], asyncDep, syncDep);
          const result = await container().getAsync(asyncDef);
          expect(result).toEqual([123, 'str']);
        });
      });

      describe(`only sync dependencies`, () => {
        it(`returns correct value`, async () => {
          const asyncDep = singleton.fn(() => 123);
          const syncDep = singleton.fn(() => 'str');

          const asyncDef = singleton.asyncFn(async (a: number, b: string) => [a, b], asyncDep, syncDep);
          const result = await container().getAsync(asyncDef);
          expect(result).toEqual([123, 'str']);
        });
      });
    });

    describe(`race condition`, () => {
      it(`does not create singleton duplicates`, async () => {
        const slowSingleton = singleton.asyncFn(() => resolveAfter(500, new BoxedValue(Math.random())));
        const consumer1 = singleton.asyncFn(async s => s, slowSingleton);
        const consumer2 = singleton.asyncFn(async s => s, slowSingleton);
        const ctn = container();

        const [result1, result2] = await Promise.all([ctn.getAsync(consumer1), ctn.getAsync(consumer2)]);

        expect(result1).toBe(result2);
      });
    });

    describe(`global overrides`, () => {
      it(`returns correct instance`, async () => {
        const slowSingleton = singleton.asyncFn(() => resolveAfter(500, new BoxedValue(Math.random())));
        const consumer1 = singleton.asyncFn(async s => s, slowSingleton);
        const consumer2 = singleton.asyncFn(async s => s, slowSingleton);
        const ctn = container({globalOverrides: [replace(singleton.asyncFn(async () => new BoxedValue(123)))]});
      });
    });
  });
});

import { singleton } from '../../../definitions/definitions';
import { container } from '../../../container/Container';
import { TestClassArgs2 } from '../../../__test__/ArgsDebug';
import { BoxedValue } from '../../../__test__/BoxedValue';
import { replace } from '../../../patching/replace';

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
        const patch = replace(
          slowSingleton,
          singleton.asyncFn(async () => new BoxedValue(123)),
        );

        const ctn = container({ globalOverrides: [patch] });
        const [result1, result2] = await Promise.all([ctn.getAsync(consumer1), ctn.getAsync(consumer2)]);
        expect(result1.value).toEqual(123);
        expect(result2.value).toEqual(123);
      });
    });
  });

  describe(`partial`, () => {
    describe(`no dependencies`, () => {
      it(`returns correct value`, async () => {
        const asyncDef = singleton.asyncPartial(async () => 123);
        const result = await container().getAsync(asyncDef);
        // this looks like it could be resolved synchronously, but in order to bind async args they needs to be awaited, therefore returning the partially applied fn also needs to be awaited
        expect(await result()).toEqual(123);
      });

      it(`returns correct value, ex.2`, async () => {
        const asyncDef = singleton.asyncPartial(async () => 123);
        const asyncConsumer = singleton.asyncFn(async def => new BoxedValue(def), asyncDef);
        const result = await container().getAsync(asyncConsumer);
        expect(await result.value()).toEqual(123);
      });
    });

    describe(`dependencies`, () => {
      describe(`mixed async and sync dependencies`, () => {
        it(`returns correct value`, async () => {
          const asyncDep = singleton.asyncFn(async () => 123);
          const syncDep = singleton.fn(() => 'str');

          const asyncDef = singleton.asyncPartial(
            async (a: number, b: string, c: string) => [a, b, c],
            asyncDep,
            syncDep,
          );
          const fn = await container().getAsync(asyncDef);
          expect(await fn('str2')).toEqual([123, 'str', 'str2']);
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

          const asyncDef = singleton.asyncPartial(
            async (a: number, b: string, c: string) => [a, b, c],
            asyncDep,
            syncDep,
          );
          const result = await container().getAsync(asyncDef);
          expect(await result('str2')).toEqual([123, 'str', 'str2']);
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
        const slowSingleton = singleton.asyncFn(() => resolveAfter(500, new BoxedValue('singleton')));
        const consumer1 = singleton.asyncPartial(async (s: BoxedValue, str: string) => [s, str], slowSingleton);
        const consumer2 = singleton.asyncPartial(async (s: BoxedValue, str: string) => [s, str], slowSingleton);
        const patch1 = replace(
          consumer1,
          singleton.asyncPartial(async (s: BoxedValue, str: string) => [s, 'replaced'], slowSingleton),
        );

        const patch2 = replace(
          consumer2,
          singleton.asyncPartial(async (s: BoxedValue, str: string) => [s, 'replaced'], slowSingleton),
        );

        const ctn = container({ globalOverrides: [patch1, patch2] });
        const [result1, result2] = await Promise.all([ctn.getAsync(consumer1), ctn.getAsync(consumer2)]);
        expect(await result1('irrelevant')).toEqual([new BoxedValue('singleton'), 'replaced']);
        expect(await result2('irrelevant')).toEqual([new BoxedValue('singleton'), 'replaced']);
      });
    });
  });
});

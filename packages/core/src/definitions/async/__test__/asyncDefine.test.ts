import { LifeTime } from '../../abstract/LifeTime.js';
import { expectType, TypeOf } from 'ts-expect';
import { scoped, singleton, transient } from '../../definitions.js';
import { container } from '../../../container/Container.js';
import { BoxedValue } from '../../../__test__/BoxedValue.js';
import { AsyncInstanceDefinition } from '../../abstract/async/AsyncInstanceDefinition.js';
import { describe, expect, it } from 'vitest';
import { implicit } from '../../sync/implicit.js';
import { set } from '../../../patching/set.js';

describe(`asyncDefine`, () => {
  const ext1 = implicit<number>('ext1');
  const ext2 = implicit<string>('ext2');

  describe(`types`, () => {
    it(`preserves externals type`, async () => {
      const definition = transient.async().define(async locator => null);
      expectType<TypeOf<typeof definition, AsyncInstanceDefinition<null, LifeTime.transient, unknown>>>(true);
    });

    it(`.get is typesafe`, async () => {
      const ext3 = implicit<string>('ext3');
      const usingBothExternals = scoped.using(ext1, ext2).fn((ext1, ext2) => [ext1, ext2]);
      const usingBothExternalsWithNotAllowed = scoped.using(ext1, ext2, ext3).fn((ext1, ext2, ext3) => [ext1, ext2]);

      const definition = transient.async().define(async locator => {
        const instance1 = locator.use(ext1);
        const instance2 = locator.use(ext2);
        const usingBoth = locator.use(usingBothExternals);

        const usingBothNotAllowed = locator.use(usingBothExternalsWithNotAllowed);

        const instance3 = locator.use(ext3);
        return null;
      });
    });
  });

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const definition = transient.async().define(async locator => {
        return [locator.use(ext1), locator.use(ext2)];
      });

      const result = await container()
        .checkoutScope({ overrides: [set(ext1, 1), set(ext2, 'str')] })
        .use(definition);
      expect(result).toEqual([1, 'str']);
    });

    it(`uses the same request scope for every get call`, async () => {
      const value = scoped.fn(() => new BoxedValue(Math.random()));

      const definition = transient.async().define(async locator => {
        return [await locator.use(value), await locator.use(value)];
      });
      const result = await container().use(definition);

      expect(result[0]).toBeInstanceOf(BoxedValue);
      expect(result[0]).toBe(result[1]);
    });

    it(`passes container with the same scope`, async () => {
      const value = scoped.fn(() => new BoxedValue(Math.random()));

      const definition = transient.async().define(async locator => {
        const scopedContainer = locator.checkoutScope();
        return [await scopedContainer.use(value), await scopedContainer.use(value)];
      });

      const cnt = container();

      const result0 = await cnt.use(value);
      const result1 = await cnt.use(definition);
      const result2 = await cnt.use(definition);

      expect(result0).not.toEqual(result1[0]);
      expect(result1[0]).not.toEqual(result2[0]);
      expect(result1[1]).not.toEqual(result2[1]);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = scoped.fn(() => new BoxedValue(Math.random()));

      const definition = singleton.async().define(async locator => {
        return [await locator.use(value), await locator.use(value)];
      });

      const cnt = container();
      const [result1, result2] = await cnt.allAsync(definition, definition);

      expect(result1).toBe(result2);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = scoped.fn(() => new BoxedValue(Math.random()));

      const definition = scoped.async().define(async locator => {
        return [await locator.use(value), await locator.use(value)];
      });

      const definitionConsumer = scoped
        .async()
        .using(definition, definition)
        .fn(async (def1, def2) => [def1, def2]);
      const cnt = container();

      const result = await cnt.use(definitionConsumer);

      expect(result[0]).toBe(result[1]);
    });
  });

  describe(`withNewRequestScope`, () => {
    it(`returns values using new request`, async () => {
      const singletonD = singleton.fn(() => new BoxedValue(Math.random()));
      const randomD = scoped.async().fn(async () => new BoxedValue(Math.random()));

      const exampleD = scoped.async().define(async locator => {
        const s1 = await locator.use(singletonD);
        const r1 = await locator.use(randomD);
        const r2 = await locator.use(randomD);

        const req2 = await locator.withScope(async locator => {
          const s1 = await locator.use(singletonD);
          const r1 = await locator.use(randomD);
          const r2 = await locator.use(randomD);

          return [s1, r1, r2];
        });

        return {
          req1: [s1, r1, r2],
          req2,
        };
      });

      const result = await container().use(exampleD);
      expect(result.req1[0]).toEqual(result.req2[0]);
    });
  });
});

import { LifeTime } from '../../abstract/LifeTime.js';
import { expectType, TypeOf } from 'ts-expect';
import { scoped, singleton } from '../../definitions.js';
import { container } from '../../../container/Container.js';
import { BoxedValue } from '../../../__test__/BoxedValue.js';

import { asyncDefine } from '../asyncDefine.js';
import { AsyncInstanceDefinition } from '../../abstract/async/AsyncInstanceDefinition.js';
import { describe, expect, it } from 'vitest';
import { implicit } from '../../sync/implicit.js';
import { set } from '../../../patching/set.js';

describe(`asyncDefine`, () => {
  const ext1 = implicit<number>('ext1');
  const ext2 = implicit<string>('ext2');

  describe(`types`, () => {
    it(`preserves externals type`, async () => {
      const definition = asyncDefine(LifeTime.transient)(async locator => null);
      expectType<TypeOf<typeof definition, AsyncInstanceDefinition<null, LifeTime.transient>>>(true);
    });

    it(`.get is typesafe`, async () => {
      const ext3 = implicit<string>('ext3');
      const usingBothExternals = scoped.fn((ext1, ext2) => [ext1, ext2], ext1, ext2);
      const usingBothExternalsWithNotAllowed = scoped.fn((ext1, ext2, ext3) => [ext1, ext2], ext1, ext2, ext3);

      const definition = asyncDefine(LifeTime.transient)(async locator => {
        const instance1 = locator.get(ext1);
        const instance2 = locator.get(ext2);
        const usingBoth = locator.get(usingBothExternals);

        const usingBothNotAllowed = locator.get(usingBothExternalsWithNotAllowed);

        const instance3 = locator.get(ext3);
        return null;
      });
    });
  });

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const definition = asyncDefine(LifeTime.transient)(async locator => {
        return [locator.get(ext1), locator.get(ext2)];
      });

      const result = await container()
        .checkoutScope({ overrides: [set(ext1, 1), set(ext2, 'str')] })
        .get(definition);
      expect(result).toEqual([1, 'str']);
    });

    it(`uses the same request scope for every get call`, async () => {
      const value = scoped.fn(() => new BoxedValue(Math.random()));

      const definition = asyncDefine(LifeTime.transient)(async locator => {
        return [await locator.get(value), await locator.get(value)];
      });
      const result = await container().get(definition);

      expect(result[0]).toBeInstanceOf(BoxedValue);
      expect(result[0]).toBe(result[1]);
    });

    it(`passes container with the same scope`, async () => {
      const value = scoped.fn(() => new BoxedValue(Math.random()));

      const definition = asyncDefine(LifeTime.transient)(async locator => {
        const scopedContainer = locator.checkoutScope();
        return [await scopedContainer.get(value), await scopedContainer.get(value)];
      });

      const cnt = container();

      const result0 = await cnt.get(value);
      const result1 = await cnt.get(definition);
      const result2 = await cnt.get(definition);

      expect(result0).not.toEqual(result1[0]);
      expect(result1[0]).not.toEqual(result2[0]);
      expect(result1[1]).not.toEqual(result2[1]);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = scoped.fn(() => new BoxedValue(Math.random()));

      const definition = asyncDefine(LifeTime.singleton)(async locator => {
        return [await locator.get(value), await locator.get(value)];
      });

      const cnt = container();
      const [result1, result2] = await cnt.getAllAsync([definition, definition]);

      expect(result1).toBe(result2);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = scoped.fn(() => new BoxedValue(Math.random()));

      const definition = asyncDefine(LifeTime.scoped)(async locator => {
        return [await locator.get(value), await locator.get(value)];
      });

      const definitionConsumer = scoped.asyncFn(async (def1, def2) => [def1, def2], definition, definition);
      const cnt = container();

      const result = await cnt.get(definitionConsumer);

      expect(result[0]).toBe(result[1]);
    });
  });

  describe(`withNewRequestScope`, () => {
    it(`returns values using new request`, async () => {
      const singletonD = singleton.fn(() => new BoxedValue(Math.random()));
      const randomD = scoped.asyncFn(async () => new BoxedValue(Math.random()));

      const exampleD = scoped.asyncDefine(async locator => {
        const s1 = await locator.get(singletonD);
        const r1 = await locator.get(randomD);
        const r2 = await locator.get(randomD);

        const req2 = await locator.withScope(async locator => {
          const s1 = await locator.get(singletonD);
          const r1 = await locator.get(randomD);
          const r2 = await locator.get(randomD);

          return [s1, r1, r2];
        });

        return {
          req1: [s1, r1, r2],
          req2,
        };
      });

      const result = await container().get(exampleD);
      expect(result.req1[0]).toEqual(result.req2[0]);
    });
  });
});

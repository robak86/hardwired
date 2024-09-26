import { LifeTime } from '../../abstract/LifeTime.js';
import { expectType, TypeOf } from 'ts-expect';
import { fn } from '../../definitions.js';
import { container } from '../../../container/Container.js';
import { BoxedValue } from '../../../__test__/BoxedValue.js';
import { describe, expect, it } from 'vitest';
import { unbound } from '../../sync/unbound.js';

import { BaseDefinition } from '../../abstract/BaseDefinition.js';

describe(`asyncDefine`, () => {
  const ext1 = unbound<number>('ext1');
  const ext2 = unbound<string>('ext2');

  describe(`types`, () => {
    it(`preserves externals type`, async () => {
      const definition = fn(async locator => null);
      expectType<TypeOf<typeof definition, BaseDefinition<Promise<null>, LifeTime.transient, unknown, []>>>(true);
    });

    it(`accepts additional params`, async () => {
      const definition = fn(async (use, userId: number) => null);
      expectType<TypeOf<typeof definition, BaseDefinition<Promise<null>, LifeTime.transient, unknown, [number]>>>(true);
    });

    it(`.get is typesafe`, async () => {
      const ext3 = unbound<string>('ext3');

      const usingBothExternals = fn.scoped(use => {
        return [use(ext1), use(ext2)];
      });

      const usingBothExternalsWithNotAllowed = fn.scoped(use => {
        return [use(ext1), use(ext2)];
      });

      // @ts-ignore
      const definition = fn(async use => {
        // @ts-ignore
        const instance1 = use(ext1);
        // @ts-ignore
        const instance2 = use(ext2);
        // @ts-ignore
        const usingBoth = use(usingBothExternals);
        // @ts-ignore
        const usingBothNotAllowed = use(usingBothExternalsWithNotAllowed);
        // @ts-ignore
        const instance3 = use(ext3);
        return null;
      });
    });
  });

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const definition = fn(async locator => {
        return [locator.use(ext1), locator.use(ext2)];
      });

      const result = await container()
        .checkoutScope({ scope: [ext1.bindValue(1), ext2.bindValue('str')] })
        .use(definition);
      expect(result).toEqual([1, 'str']);
    });

    it(`uses the same request scope for every get call`, async () => {
      const value = fn.scoped(async () => new BoxedValue(Math.random()));

      const definition = fn(async locator => {
        return [await locator.use(value), await locator.use(value)];
      });
      const result = await container().use(definition);

      expect(result[0]).toBeInstanceOf(BoxedValue);
      expect(result[0]).toBe(result[1]);
    });

    it(`passes container with the same scope`, async () => {
      const value = fn.scoped(() => new BoxedValue(Math.random()));

      const definition = fn(async locator => {
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
      const value = fn.singleton(() => new BoxedValue(Math.random()));

      const definition = fn.singleton(async locator => {
        return [await locator.use(value), await locator.use(value)];
      });

      const cnt = container();
      const [result1, result2] = await cnt.allAsync(definition, definition);

      expect(result1).toBe(result2);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = fn.scoped(() => new BoxedValue(Math.random()));

      const definition = fn.scoped(async use => {
        return [await use(value), await use(value)];
      });

      const definitionConsumer = fn.scoped(use => {
        return [use(definition), use(definition)];
      });

      const cnt = container();

      const result = await cnt.use(definitionConsumer);

      expect(result[0]).toBe(result[1]);
    });
  });

  describe(`withNewRequestScope`, () => {
    it(`returns values using new request`, async () => {
      const singletonD = fn.singleton(async () => new BoxedValue(Math.random()));
      const randomD = fn.scoped(async () => new BoxedValue(Math.random()));

      const exampleD = fn.scoped(async use => {
        const s1 = await use(singletonD);
        const r1 = await use(randomD);
        const r2 = await use(randomD);

        const req2 = await use.withScope(async use => {
          const s1 = await use(singletonD);
          const r1 = await use(randomD);
          const r2 = await use(randomD);

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

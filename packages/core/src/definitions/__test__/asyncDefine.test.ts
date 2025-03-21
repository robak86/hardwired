import type { TypeOf } from 'ts-expect';
import { expectType } from 'ts-expect';
import { describe, expect, it } from 'vitest';

import type { LifeTime } from '../abstract/LifeTime.js';
import { fn } from '../fn.js';
import { container } from '../../container/Container.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { unbound } from '../unbound.js';
import type { Definition } from '../impl/Definition.js';

describe(`asyncDefine`, () => {
  const ext1 = unbound<number>();
  const ext2 = unbound<string>();

  describe(`types`, () => {
    it(`preserves externals type`, async () => {
      const definition = fn(async () => null);

      expectType<TypeOf<typeof definition, Definition<Promise<null>, LifeTime.transient, []>>>(true);
    });

    it(`accepts additional params`, async () => {
      const definition = fn(async (_use, _userId: number) => null);

      expectType<TypeOf<typeof definition, Definition<Promise<null>, LifeTime.transient, [number]>>>(true);
    });

    it(`.get is typesafe`, async () => {
      const ext3 = unbound<string>();

      const usingBothExternals = fn.scoped(use => {
        return [use(ext1), use(ext2)];
      });

      const usingBothExternalsWithNotAllowed = fn.scoped(use => {
        return [use(ext1), use(ext2)];
      });

      // @ts-ignore
      const _definition = fn(async use => {
        // @ts-ignore
        const _instance1 = use(ext1);
        // @ts-ignore
        const _instance2 = use(ext2);
        // @ts-ignore
        const _usingBoth = use(usingBothExternals);
        // @ts-ignore
        const _usingBothNotAllowed = use(usingBothExternalsWithNotAllowed);
        // @ts-ignore
        const _instance3 = use(ext3);

        return null;
      });
    });
  });

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const definition = fn(async locator => {
        return [locator.use(ext1), locator.use(ext2)];
      });

      const result = await container
        .new()
        .scope(c => {
          c.bind(ext1).toValue(1);
          c.bind(ext2).toValue('str');
        })
        .use(definition);

      expect(result).toEqual([1, 'str']);
    });

    it(`uses the same request scope for every get call`, async () => {
      const value = fn.scoped(async () => new BoxedValue(Math.random()));

      const definition = fn(async locator => {
        return [await locator.use(value), await locator.use(value)];
      });
      const result = await container.new().use(definition);

      expect(result[0]).toBeInstanceOf(BoxedValue);
      expect(result[0]).toBe(result[1]);
    });

    it(`passes container with the same scope`, async () => {
      const value = fn.scoped(() => new BoxedValue(Math.random()));

      const definition = fn(async locator => {
        const scopedContainer = locator.scope();

        return [scopedContainer(value), scopedContainer(value)];
      });

      const cnt = container.new();

      const result0 = cnt.use(value);
      const result1 = await cnt.use(definition);
      const result2 = await cnt.use(definition);

      expect(result0).not.toEqual(result1[0]);
      expect(result1[0]).not.toEqual(result2[0]);
      expect(result1[1]).not.toEqual(result2[1]);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = fn.singleton(() => new BoxedValue(Math.random()));

      const definition = fn.singleton(async locator => {
        return [locator.use(value), locator.use(value)];
      });

      const cnt = container.new();
      const [result1, result2] = await cnt.all(definition, definition);

      expect(result1).toBe(result2);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = fn.scoped(() => new BoxedValue(Math.random()));

      const definition = fn.scoped(async use => {
        return [use(value), use(value)];
      });

      const definitionConsumer = fn.scoped(use => {
        return [use(definition), use(definition)];
      });

      const cnt = container.new();

      const result = cnt.use(definitionConsumer);

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

        const reqScope = use.scope();

        const req2 = [await reqScope.use(singletonD), await reqScope.use(randomD), await reqScope.use(randomD)];

        return {
          req1: [s1, r1, r2],
          req2,
        };
      });

      const result = await container.new().use(exampleD);

      expect(result.req1[0]).toEqual(result.req2[0]);
    });
  });
});

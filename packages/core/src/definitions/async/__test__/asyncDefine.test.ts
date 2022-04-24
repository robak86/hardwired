import { LifeTime } from '../../abstract/LifeTime';
import { expectType, TypeEqual } from 'ts-expect';
import { request, singleton } from '../../definitions';
import { container } from '../../../container/Container';
import { BoxedValue } from '../../../__test__/BoxedValue';
import { external } from '../../sync/external';
import { asyncDefine } from '../asyncDefine';
import { AsyncInstanceDefinition } from '../../abstract/base/AsyncInstanceDefinition';

describe(`asyncDefine`, () => {
  type Ext1 = { ext1: number };
  type Ext2 = { ext2: string };

  const ext1 = external<Ext1>();
  const ext2 = external<Ext2>();

  describe(`types`, () => {
    it(`does not allow externals for singleton lifetime`, async () => {
      const build = () => {
        // @ts-expect-error - accepts only single parameter (without externals)
        const z = asyncDefine(LifeTime.singleton)([ext1], async locator => null);
      }

      expect(build).toThrow('Externals with singleton life time are not supported')
    });

    it(`preserves externals type`, async () => {
      const definition = asyncDefine(LifeTime.transient)([ext1, ext2], async locator => null);
      expectType<TypeEqual<typeof definition, AsyncInstanceDefinition<null, LifeTime.transient, [Ext1, Ext2]>>>(true);
    });

    it(`.get is typesafe`, async () => {
      const ext3 = external<{ ext3: string }>();
      const usingBothExternals = request.fn((ext1, ext2) => [ext1, ext2], ext1, ext2);
      const usingBothExternalsWithNotAllowed = request.fn((ext1, ext2, ext3) => [ext1, ext2], ext1, ext2, ext3);

      const definition = asyncDefine(LifeTime.transient)([ext1, ext2], async locator => {
        const instance1 = await locator.get(ext1);
        const instance2 = await locator.get(ext2);
        const usingBoth = await locator.get(usingBothExternals);

        // @ts-expect-error - does not accept definitions with ext3 because it wasn't provided to externals [ext1, ext2]
        const usingBothNotAllowed = await locator.get(usingBothExternalsWithNotAllowed);

        // @ts-expect-error - does not accept definitions with ext3 because it wasn't provided to externals [ext1, ext2]
        const instance3 = await locator.get(ext3);
        return null;
      });
    });
  });

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const definition = asyncDefine(LifeTime.transient)([ext1, ext2], async locator => {
        return [await locator.get(ext1), await locator.get(ext2)];
      });

      const result = await container().getAsync(definition.bind({ ext1: 1 }, { ext2: 'str' }));
      expect(result).toEqual([{ ext1: 1 }, { ext2: 'str' }]);
    });

    it(`uses the same request scope for every get call`, async () => {
      const value = request.fn(() => new BoxedValue(Math.random()));

      const definition = asyncDefine(LifeTime.transient)(async locator => {
        return [await locator.get(value), await locator.get(value)];
      });
      const result = await container().getAsync(definition);

      expect(result[0]).toBeInstanceOf(BoxedValue);
      expect(result[0]).toBe(result[1]);
    });

    it(`correctly uses transient lifetime`, async () => {
      const value = request.fn(() => new BoxedValue(Math.random()));

      const definition = asyncDefine(LifeTime.transient)(async locator => {
        return [await locator.get(value), await locator.get(value)];
      });

      const cnt = container();

      const result1 = await cnt.getAsync(definition);
      const result2 = await cnt.getAsync(definition);

      expect(result1[0]).not.toEqual(result2[0]);
      expect(result1[1]).not.toEqual(result2[1]);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = request.fn(() => new BoxedValue(Math.random()));

      const definition = asyncDefine(LifeTime.singleton)(async locator => {
        return [await locator.get(value), await locator.get(value)];
      });

      const cnt = container();
      const [result1, result2] = await cnt.getAllAsync(definition, definition);

      expect(result1).toBe(result2);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = request.fn(() => new BoxedValue(Math.random()));

      const definition = asyncDefine(LifeTime.request)(async locator => {
        return [await locator.get(value), await locator.get(value)];
      });

      const definitionConsumer = request.asyncFn(async (def1, def2) => [def1, def2], definition, definition);
      const cnt = container();

      const result = await cnt.getAsync(definitionConsumer);

      expect(result[0]).toBe(result[1]);
    });
  });

  describe(`withNewRequestScope`, () => {
    it(`returns values using new request`, async () => {
      const singletonD = singleton.fn(() => new BoxedValue(Math.random()));
      const randomD = request.asyncFn(async () => new BoxedValue(Math.random()));

      const exampleD = request.asyncDefine(async locator => {
        const s1 = await locator.get(singletonD);
        const r1 = await locator.getAsync(randomD);
        const r2 = await locator.getAsync(randomD);

        const req2 = await locator.withNewRequestScope(async locator => {
          const s1 = await locator.get(singletonD);
          const r1 = await locator.getAsync(randomD);
          const r2 = await locator.getAsync(randomD);

          return [s1, r1, r2];
        });

        return {
          req1: [s1, r1, r2],
          req2,
        };
      });

      const result = await container().getAsync(exampleD);
      expect(result.req1[0]).toEqual(result.req2[0]);
    });
  });
});

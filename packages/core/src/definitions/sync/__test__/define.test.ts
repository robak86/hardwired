import { external } from '../external';
import { define } from '../define';
import { LifeTime } from '../../abstract/LifeTime';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/base/InstanceDefinition';
import { request, singleton } from '../../definitions';
import { container } from '../../../container/Container';
import { BoxedValue } from '../../../__test__/BoxedValue';

describe(`define`, () => {
  type Ext1 = { ext1: number };
  type Ext2 = { ext2: string };

  const ext1 = external<Ext1>();
  const ext2 = external<Ext2>();

  describe(`types`, () => {
    it(`does not allow externals for singleton lifetime`, async () => {
      const buildDef = () => {
        // @ts-expect-error - accepts only single parameter (without externals)
        const z = define(LifeTime.singleton)([ext1], locator => null);
      }
      expect(buildDef).toThrow('Externals with singleton life time are not supported');
    });

    it(`preserves externals type`, async () => {
      const definition = define(LifeTime.transient)([ext1, ext2], locator => null);
      expectType<TypeEqual<typeof definition, InstanceDefinition<null, LifeTime.transient, [Ext1, Ext2]>>>(true);
    });

    it(`.get is typesafe`, async () => {
      const ext3 = external<{ ext3: string }>();
      const usingBothExternals = request.fn((ext1, ext2) => [ext1, ext2], ext1, ext2);
      const usingBothExternalsWithNotAllowed = request.fn((ext1, ext2, ext3) => [ext1, ext2], ext1, ext2, ext3);

      const definition = define(LifeTime.transient)([ext1, ext2], locator => {
        const instance1 = locator.get(ext1);
        const instance2 = locator.get(ext2);
        const usingBoth = locator.get(usingBothExternals);

        // @ts-expect-error - does not accept definitions with ext3 because it wasn't provided to externals [ext1, ext2]
        const usingBothNotAllowed = locator.get(usingBothExternalsWithNotAllowed);

        // @ts-expect-error - does not accept definitions with ext3 because it wasn't provided to externals [ext1, ext2]
        const instance3 = locator.get(ext3);
        return null;
      });
    });
  });

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const definition = define(LifeTime.transient)([ext1, ext2], locator => {
        return [locator.get(ext1), locator.get(ext2)];
      });

      const result = container().get(definition.bind({ ext1: 1 }, { ext2: 'str' }));
      expect(result).toEqual([{ ext1: 1 }, { ext2: 'str' }]);
    });

    it(`uses the same request scope for every get call`, async () => {
      const value = request.fn(() => new BoxedValue(Math.random()));

      const definition = define(LifeTime.transient)(locator => {
        return [locator.get(value), locator.get(value)];
      });
      const result = container().get(definition);

      expect(result[0]).toBeInstanceOf(BoxedValue);
      expect(result[0]).toBe(result[1]);
    });

    it(`correctly uses transient lifetime`, async () => {
      const value = request.fn(() => new BoxedValue(Math.random()));

      const definition = define(LifeTime.transient)(locator => {
        return [locator.get(value), locator.get(value)];
      });

      const cnt = container();

      const result1 = cnt.get(definition);
      const result2 = cnt.get(definition);

      expect(result1[0]).not.toEqual(result2[0]);
      expect(result1[1]).not.toEqual(result2[1]);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = request.fn(() => new BoxedValue(Math.random()));

      const definition = define(LifeTime.singleton)(locator => {
        return [locator.get(value), locator.get(value)];
      });

      const cnt = container();
      const [result1, result2] = cnt.getAll(definition, definition);

      expect(result1).toBe(result2);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = request.fn(() => new BoxedValue(Math.random()));

      const definition = define(LifeTime.request)(locator => {
        return [locator.get(value), locator.get(value)];
      });

      const definitionConsumer = request.fn((def1, def2) => [def1, def2], definition, definition);
      const cnt = container();

      const result = cnt.get(definitionConsumer);

      expect(result[0]).toBe(result[1]);
    });
  });

  describe(`withNewRequestScope`, () => {
    it(`returns values using new request`, async () => {
      const singletonD = singleton.fn(() => new BoxedValue(Math.random()));
      const randomD = request.fn(() => new BoxedValue(Math.random()));

      const exampleD = request.define(locator => {
        const s1 = locator.get(singletonD);
        const r1 = locator.get(randomD);
        const r2 = locator.get(randomD);

        const req2 = locator.withNewRequestScope(locator => {
          const s1 = locator.get(singletonD);
          const r1 = locator.get(randomD);
          const r2 = locator.get(randomD);

          return [s1, r1, r2];
        });

        return {
          req1: [s1, r1, r2],
          req2,
        };
      });

      const result = container().get(exampleD);
      expect(result.req1[0]).toEqual(result.req2[0])
    });
  });
});

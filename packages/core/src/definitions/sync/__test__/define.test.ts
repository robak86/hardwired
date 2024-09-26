import { implicit } from '../implicit.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { expectType, TypeOf } from 'ts-expect';
import { fn } from '../../definitions.js';
import { container } from '../../../container/Container.js';
import { BoxedValue } from '../../../__test__/BoxedValue.js';
import { describe, expect, it } from 'vitest';
import { BaseDefinition } from '../../abstract/FnDefinition.js';

describe(`define`, () => {
  const ext1 = implicit<number>('ext1');
  const ext2 = implicit<string>('ext2');

  describe(`types`, () => {
    it(`preserves externals type`, async () => {
      const definition = fn(locator => null);
      expectType<TypeOf<typeof definition, BaseDefinition<null, LifeTime.transient, any, []>>>(true);
    });
  });

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const definition = fn(locator => {
        return [locator.use(ext1), locator.use(ext2)];
      });

      const result = container()
        .checkoutScope({ overrides: [ext1.bindValue(1), ext2.bindValue('str')] })
        .use(definition);
      expect(result).toEqual([1, 'str']);
    });

    it(`uses the same request scope for every get call`, async () => {
      const value = fn.scoped(() => new BoxedValue(Math.random()));

      const definition = fn(locator => {
        return [locator.use(value), locator.use(value)];
      });
      const result = container().use(definition);

      expect(result[0]).toBeInstanceOf(BoxedValue);
      expect(result[0]).toBe(result[1]);
    });

    it(`correctly uses transient lifetime`, async () => {
      const value = fn.scoped(() => new BoxedValue(Math.random()));

      const definition = fn(locator => {
        const scopedContainer = locator.checkoutScope();
        return [scopedContainer.use(value), scopedContainer.use(value)];
      });

      const cnt = container();

      const result1 = cnt.use(definition);
      const result2 = cnt.use(definition);

      expect(result1[0]).not.toEqual(result2[0]);
      expect(result1[1]).not.toEqual(result2[1]);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = fn.singleton(() => new BoxedValue(Math.random()));

      const definition = fn.singleton(locator => {
        return [locator.use(value), locator.use(value)];
      });

      const cnt = container();
      const [result1, result2] = cnt.all(definition, definition);

      expect(result1).toBe(result2);
    });

    it(`correctly uses singleton lifetime`, async () => {
      const value = fn.scoped(() => new BoxedValue(Math.random()));

      const definition = fn.scoped(locator => {
        return [locator.use(value), locator.use(value)];
      });

      const definitionConsumer = fn.scoped(use => {
        return [use(definition), use(definition)];
      });

      const cnt = container();

      const result = cnt.use(definitionConsumer);

      expect(result[0]).toBe(result[1]);
    });
  });

  describe(`withNewRequestScope`, () => {
    it(`returns values using new request`, async () => {
      const singletonD = fn.singleton(() => new BoxedValue(Math.random()));
      const randomD = fn.scoped(() => new BoxedValue(Math.random()));

      const exampleD = fn.scoped(use => {
        const s1 = use(singletonD);
        const r1 = use(randomD);
        const r2 = use(randomD);

        const req2 = use.withScope(use => {
          const s1 = use(singletonD);
          const r1 = use(randomD);
          const r2 = use(randomD);

          return [s1, r1, r2];
        });

        return {
          req1: [s1, r1, r2],
          req2,
        };
      });

      const result = container().use(exampleD);
      expect(result.req1[0]).toEqual(result.req2[0]);
    });
  });
});

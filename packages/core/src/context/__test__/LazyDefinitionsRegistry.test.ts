import type { ILazyDefinitionBuilder } from '../../configuration/dsl/new/utils/abstract/ILazyDefinitionBuilder.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import type { IDefinition } from '../../definitions/abstract/IDefinition.js';
import { LazyDefinitionsRegistry } from '../LazyDefinitionsRegistry.js';
import type { IDefinitionToken } from '../../definitions/tokens.js';

describe(`LazyDefinitionsRegistry`, () => {
  function buildLazyDef(
    id: string,
    decorateFn: (val: number) => number = val => val,
  ): ILazyDefinitionBuilder<number, LifeTime.transient> {
    return {
      token: {
        id: Symbol.for(id),
        strategy: LifeTime.transient,
      } as IDefinitionToken<number, LifeTime.transient>,

      build(def: IDefinition<number, LifeTime.transient>): IDefinition<number, LifeTime.transient> {
        return def.override((locator, interceptor) => def.create(locator, interceptor).then(decorateFn));
      },
    };
  }

  describe(`empty root`, () => {
    describe(`hasOwn`, () => {
      it(`returns true `, async () => {
        const registry = LazyDefinitionsRegistry.empty();

        const def = buildLazyDef('a');

        registry.append(def);
        expect(registry.hasOwn(def.token.id)).toBe(true);
      });
    });
  });

  describe(`checkoutScope`, () => {
    it(`creates child registry with linked values`, async () => {
      const parent = LazyDefinitionsRegistry.empty();
      const child1Values = LazyDefinitionsRegistry.empty();
      const child2Values = LazyDefinitionsRegistry.empty();

      const def1 = buildLazyDef('a', val => val + 1);

      child1Values.append(def1);

      const child = parent.checkoutScope([child1Values, child2Values]);

      expect(child.hasOwn(def1.token.id)).toBe(true);
    });

    it(`aggregates values from the same level registries`, async () => {
      const parent = LazyDefinitionsRegistry.empty();
      const child1Values = LazyDefinitionsRegistry.empty();
      const child2Values = LazyDefinitionsRegistry.empty();

      const def1 = buildLazyDef('a', val => val + 1);
      const def2 = buildLazyDef('a', val => val + 1);

      child1Values.append(def1);
      child2Values.append(def2);

      const child = parent.checkoutScope([child1Values, child2Values]);

      const result = child.getOwn(def1.token.id);

      expect(result).toEqual([def2, def1]);
    });
  });
});

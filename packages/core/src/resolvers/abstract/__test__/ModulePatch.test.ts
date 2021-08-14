import { ImmutableMap } from '../../../collections/ImmutableMap';
import { singleton, SingletonStrategy } from '../../../strategies/SingletonStrategy';
import { Module } from '../../../module/Module';

describe(`ModulePatch`, () => {
  describe(`replace`, () => {
    it(`preserves previous resolver id if strategy factory function is used`, async () => {
      const originalAResolver = singleton(() => 1);
      const dummyStrategyTag = Symbol();

      const m = new Module<{ a: SingletonStrategy<number> }>(
        { id: 'id', revision: 'someId' },
        ImmutableMap.empty().extend('a', {
          id: 'a',
          type: 'resolver' as const,
          strategyTag: dummyStrategyTag,
          resolverThunk: originalAResolver,
        }),
      );

      const withReplacedA = m.replace('a', () => 2);
      const updatedAResolver = withReplacedA.patchedResolvers.get('a') as Module.InstanceDefinition;
      expect(updatedAResolver.id).toEqual('a');
    });

    it(`preserves module original id`, async () => {
      const dummyStrategyTag = Symbol();

      const m = new Module<{ a: SingletonStrategy<number> }>(
        { id: 'id', revision: 'someId' },
        ImmutableMap.empty().extend('a', {
          id: 'a',
          type: 'resolver' as const,
          strategyTag: dummyStrategyTag,
          resolverThunk: singleton(() => 1),
        }),
      );
      const patch = m.replace('a', () => 3);
      expect(patch.moduleId).toEqual(m.moduleId);
    });
  });
});

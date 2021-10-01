import { ImmutableMap } from '../../collections/ImmutableMap';
import { singleton, SingletonStrategyLegacy } from '../../strategies/SingletonStrategyLegacy';
import { Module } from '../Module';

describe(`ModulePatch`, () => {
  describe(`replace`, () => {
    it(`preserves previous resolver id`, async () => {
      const originalAResolver = singleton(() => 1);
      const dummyStrategyTag = Symbol();

      const m = new Module<{ a: SingletonStrategyLegacy<number> }>(
        { id: 'id' },
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

      const m = new Module<{ a: SingletonStrategyLegacy<number> }>(
        { id: 'id' },
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

    it.todo(`reuses original BuildStrategy`);
  });

  describe(`set`, () => {
    it(`delegates to replace with correct params`, async () => {
      const originalAResolver = singleton(() => 1);
      const dummyStrategyTag = Symbol();

      const m = new Module<{ a: SingletonStrategyLegacy<number> }>(
        { id: 'id' },
        ImmutableMap.empty().extend('a', {
          id: 'a',
          type: 'resolver' as const,
          strategyTag: dummyStrategyTag,
          resolverThunk: originalAResolver,
        }),
      );

      const replaceSpy = jest.spyOn(m, 'replace');
      const withNewValueSet = m.set('a', 2);
      expect(replaceSpy.mock.calls[0][0]).toEqual('a');
      const thunk: any = replaceSpy.mock.calls[0][1];
      expect(thunk()).toEqual(2);
    });

    it.todo(`reuses original BuildStrategy`);
  });
});

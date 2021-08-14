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

  describe(`patch`, () => {
    it(`merges only replaced values`, async () => {
      const a_plus_b_Resolver = singleton(() => 3);

      const m = new Module<any>(
        { id: 'id', revision: 'someId' },
        ImmutableMap.empty()
          .extend('a', {
            id: 'a',
            type: 'resolver' as const,
            resolverThunk: singleton(() => 1),
          })
          .extend('b', {
            id: 'b',
            type: 'resolver' as const,
            resolverThunk: singleton(() => 2),
          })
          .extend('a_plus_b', {
            id: 'c',
            type: 'resolver' as const,
            resolverThunk: a_plus_b_Resolver,
          }),
      );

      const aReplacementResolver = singleton(() => 20);

      const m1 = m.replace('a', aReplacementResolver);

      const bReplacementResolver = singleton(() => 30);

      const m2 = m.replace('b', bReplacementResolver);

      const patched = Module.fromPatchedModules([m1, m2]);

      expect(patched.registry.entries).toEqual([
        ['a_plus_b', { id: 'c', type: 'resolver', resolverThunk: a_plus_b_Resolver }],
        ['a', { id: 'a', type: 'resolver', resolverThunk: aReplacementResolver }],
        ['b', { id: 'b', type: 'resolver', resolverThunk: bReplacementResolver }],
      ]);
    });

    it(`replaces already replaced keys`, async () => {
      const a_plus_b_Resolver = singleton(() => 3);
      const bOriginalResolver = singleton(() => 2);

      const m = new Module<any>(
        { id: 'id', revision: 'someId' },
        ImmutableMap.empty()
          .extend('a', {
            id: 'a',
            type: 'resolver' as const,
            resolverThunk: singleton(() => 1),
          })
          .extend('b', {
            id: 'b',
            type: 'resolver' as const,
            resolverThunk: bOriginalResolver,
          })
          .extend('a_plus_b', {
            id: 'c',
            type: 'resolver' as const,
            resolverThunk: a_plus_b_Resolver,
          }),
      );

      const aReplacementResolver = singleton(() => 20);

      const m1 = m.replace('a', aReplacementResolver);

      const yetAnotherAReplacement = singleton(() => 30);

      const m2 = m.replace('a', yetAnotherAReplacement);

      const patched = Module.fromPatchedModules([m1, m2]);

      expect(patched.registry.entries).toEqual([
        ['b', { id: 'b', type: 'resolver', resolverThunk: bOriginalResolver }],
        ['a_plus_b', { id: 'c', type: 'resolver', resolverThunk: a_plus_b_Resolver }],
        ['a', { id: 'a', type: 'resolver', resolverThunk: yetAnotherAReplacement }],
      ]);
    });
  });
});

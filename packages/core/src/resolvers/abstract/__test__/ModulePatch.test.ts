import { ImmutableMap } from '../../../collections/ImmutableMap';
import { singleton, SingletonStrategy } from '../../../strategies/SingletonStrategy';
import { Module } from '../Module';
import { unwrapThunk } from '../../../utils/Thunk';
import { Instance } from '../Instance';

describe(`ModulePatch`, () => {
  describe(`replace`, () => {
    it(`preserves previous resolver id if strategy factory function is used`, async () => {
      const originalAResolver = singleton(() => 1);
      const m = new Module<{ a: SingletonStrategy<number> }>(
        { id: 'someId' },
        ImmutableMap.empty().extend('a', {
          id: 'a',
          type: 'resolver' as const,
          resolverThunk: originalAResolver,
        }),
      );

      const withReplacedA = m.replace('a', () => 2);
      const updatedAResolver = withReplacedA.patchedResolvers.get('a') as Module.BoundInstance;
      expect(updatedAResolver.id).toEqual('a');
    });
  });

  describe(`patch`, () => {
    it(`merges only replaced values`, async () => {
      const a_plus_b_Resolver = singleton(() => 3);

      const m = new Module<any>(
        { id: 'someId' },
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

      const patched = m.patch(m1).patch(m2);

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
        { id: 'someId' },
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

      const patched = m.patch(m1).patch(m2);

      expect(patched.registry.entries).toEqual([
        ['b', { id: 'b', type: 'resolver', resolverThunk: bOriginalResolver }],
        ['a_plus_b', { id: 'c', type: 'resolver', resolverThunk: a_plus_b_Resolver }],
        ['a', { id: 'a', type: 'resolver', resolverThunk: yetAnotherAReplacement }],
      ]);
    });
  });
});

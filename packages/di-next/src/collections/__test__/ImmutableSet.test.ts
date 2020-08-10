import { ImmutableSet } from '../ImmutableSet';

describe(`ImmutableSet`, () => {
  describe(`merge`, () => {
    it(`merges other object into current`, async () => {
      const a = ImmutableSet.empty().extend('a', 1).extend('b', 2).extend('c', 3);
      const b = ImmutableSet.empty().extend('b', 22).extend('c', 33);
      const merged = a.merge(b);
      expect(merged.entries).toEqual([
        ['a', 1],
        ['b', 22],
        ['c', 33],
      ]);
    });
  });
});

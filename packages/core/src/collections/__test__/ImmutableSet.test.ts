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

  describe(`replace`, () => {
    it(`replaces entry`, async () => {
      const a = ImmutableSet.empty().extend('a', 1);
      expect(a.replace('a', 2).get('a')).toEqual(2);
    });

    it(`adds replaced key at the end of keys`, async () => {
      const a = ImmutableSet.empty().extend('a', 1).extend('b', 2);
      const updated = a.replace('a', 2);
      expect(updated.keys).toEqual(['a', 'b']);
    });
  });

  describe(`extend`, () => {
    it(`adds new value to the set`, async () => {
      const a = ImmutableSet.empty().extend('a', 1);
      expect(a.get('a')).toEqual(1);
    });
  });

  describe(`forEach`, () => {
    it(`iterates over all items`, async () => {
      const a = ImmutableSet.empty().extend('a', 'aVal').extend('b', 'bVal');
      const iterSpy = jest.fn();
      a.forEach(iterSpy);
      expect(iterSpy.mock.calls).toEqual([
        ['aVal', 'a'],
        ['bVal', 'b'],
      ]);
    });

    it(`iterates over replaced keys`, async () => {
      const a = ImmutableSet.empty().extend('a', 'aVal').extend('b', 'bVal');
      const updated = a.replace('a', 'aReplaced');
      const iterSpy = jest.fn();

      updated.forEach(iterSpy);
      expect(iterSpy.mock.calls).toEqual([
        ['aReplaced', 'a'],
        ['bVal', 'b'],
      ]);
    });
  });

  describe(`entries`, () => {
    it(`returns array of key value objects`, async () => {
      const a = ImmutableSet.empty().extend('a', 'aVal').extend('b', 'bVal');
      expect(a.entries).toEqual([
        ['a', 'aVal'],
        ['b', 'bVal'],
      ]);
    });
  });

  describe(`set`, () => {
    it(`replaces existing value`, async () => {
      const a = ImmutableSet.empty().extend('a', 1);
      expect(a.set('a', 2).get('a')).toEqual(2);
    });
  });
});

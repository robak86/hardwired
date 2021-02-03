import { ImmutableMap } from '../ImmutableMap';

describe(`ImmutableMap`, () => {
  describe(`merge`, () => {
    it(`merges other object into current`, async () => {
      const a = ImmutableMap.empty().extend('a', 1).extend('b', 2).extend('c', 3);
      const b = ImmutableMap.empty().extend('b', 22).extend('c', 33);
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
      const a = ImmutableMap.empty().extend('a', 1);
      expect(a.replace('a', 2).get('a')).toEqual(2);
    });

    it(`adds replaced key at the end of keys`, async () => {
      const a = ImmutableMap.empty().extend('a', 1).extend('b', 2);
      const updated = a.replace('a', 2);
      expect(updated.keys).toEqual(['b', 'a']);
    });
  });

  describe(`extend`, () => {
    it(`adds new value to the set`, async () => {
      const a = ImmutableMap.empty().extend('a', 1);
      expect(a.get('a')).toEqual(1);
    });

    it(`does not mutate original element`, async () => {
      const emptySet = ImmutableMap.empty();
      emptySet.extend('a', 1);
      emptySet.extend('b', 1);

      expect(emptySet.keys).toEqual([]);
    });
  });

  describe(`forEach`, () => {
    it(`iterates over all items`, async () => {
      const a = ImmutableMap.empty().extend('a', 'aVal').extend('b', 'bVal');
      const iterSpy = jest.fn();
      a.forEach(iterSpy);
      expect(iterSpy.mock.calls).toEqual([
        ['aVal', 'a'],
        ['bVal', 'b'],
      ]);
    });

    it(`iterates over replaced keys`, async () => {
      const a = ImmutableMap.empty().extend('a', 'aVal').extend('b', 'bVal');
      const updated = a.replace('a', 'aReplaced');
      const iterSpy = jest.fn();

      updated.forEach(iterSpy);
      expect(iterSpy.mock.calls).toEqual([
        ['bVal', 'b'],
        ['aReplaced', 'a'],
      ]);
    });
  });

  describe(`entries`, () => {
    it(`returns array of key value objects`, async () => {
      const a = ImmutableMap.empty().extend('a', 'aVal').extend('b', 'bVal');
      expect(a.entries).toEqual([
        ['a', 'aVal'],
        ['b', 'bVal'],
      ]);
    });
  });

  describe(`set`, () => {
    it(`replaces existing value`, async () => {
      const a = ImmutableMap.empty().extend('a', 1);
      expect(a.set('a', 2).get('a')).toEqual(2);
    });
  });

  describe(`reverse`, () => {
    it(`reverses the order of keys`, async () => {
      const a = ImmutableMap.empty().extend('a', 1).extend('b', 2);
      const reversed = a.reverse();
      expect(reversed.keys).toEqual(['b', 'a']);
    });

    it(`does not mutate original collection`, async () => {
      const a = ImmutableMap.empty().extend('a', 1).extend('b', 2);
      const reversed = a.reverse();
      expect(a.keys).toEqual(['a', 'b']);
    });
  });

  describe(`remove`, () => {
    it(`removes a item`, async () => {
      const a = ImmutableMap.empty().extend('a', 1).extend('b', 2);
      const withoutA = a.remove('a');
      expect(withoutA.entries).toEqual([['b', 2]]);
    });

    it(`does not mutate original collection`, async () => {
      const a = ImmutableMap.empty().extend('a', 1).extend('b', 2);
      const withoutA = a.remove('a');
      expect(a.entries).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });
  });

  describe(`getOr`, () => {
    it(`returns existing value if present`, async () => {
      const a = ImmutableMap.empty().extend('a', 1).extend('b', 2);
      expect(a.getOr('a', 123)).toEqual(1);
    });

    it(`returns default value if map is missing given key`, async () => {
      const a = ImmutableMap.empty().extend('a', 1).extend('b', 2);
      expect(a.getOr('c', 123)).toEqual(123);
    });
  });
});

import { describe, it, expect } from 'vitest';

import { COWMap } from '../COWMap.js';

describe('COWMap', () => {
  it('should create an empty COWMap', () => {
    const map = COWMap.create<number>();

    expect(map.has(Symbol('test'))).toBe(false);
  });

  it('should set and get a value', () => {
    const map = COWMap.create<number>();
    const key = Symbol('key');

    map.set(key, 42);
    expect(map.get(key)).toBe(42);
  });

  it('should return false for hasOwn when key is inherited', () => {
    const map = COWMap.create<number>();
    const key = Symbol('key');

    map.set(key, 42);
    const clonedMap = map.clone();

    expect(clonedMap.hasOwn(key)).toBe(false);
  });

  describe('COWMap - hasOwn', () => {
    it('should return false for hasOwn when no keys are set', () => {
      const map = COWMap.create<number>();
      const key = Symbol('key');

      expect(map.hasOwn(key)).toBe(false);
    });

    it('should return true for hasOwn when a key is set directly on the map', () => {
      const map = COWMap.create<number>();
      const key = Symbol('key');

      map.set(key, 42);
      expect(map.hasOwn(key)).toBe(true);
    });

    it('should return false for hasOwn when a key is inherited from a cloned map', () => {
      const map = COWMap.create<number>();
      const key = Symbol('key');

      map.set(key, 42);
      const clonedMap = map.clone();

      expect(clonedMap.hasOwn(key)).toBe(false);
    });

    it('should return true for hasOwn when a key is overridden in a cloned map', () => {
      const map = COWMap.create<number>();
      const key = Symbol('key');

      map.set(key, 42);
      const clonedMap = map.clone();

      clonedMap.set(key, 84);

      expect(clonedMap.hasOwn(key)).toBe(true);
    });

    it('should return false for hasOwn when a key is set in the original map after cloning', () => {
      const map = COWMap.create<number>();
      const key = Symbol('key');

      const clonedMap = map.clone();

      map.set(key, 42);

      expect(clonedMap.hasOwn(key)).toBe(false);
    });

    it('should return true for hasOwn when a key is set in the cloned map after cloning', () => {
      const map = COWMap.create<number>();
      const key = Symbol('key');

      const clonedMap = map.clone();

      clonedMap.set(key, 42);

      expect(clonedMap.hasOwn(key)).toBe(true);
    });

    it('should return true for hasOwn when key is set on the cloned map', () => {
      const map = COWMap.create<number>();
      const key = Symbol('key');

      map.set(key, 42);
      const clonedMap = map.clone();

      clonedMap.set(key, 84);
      expect(clonedMap.hasOwn(key)).toBe(true);
    });
  });

  it('should clone the map and not affect the original when setting a value', () => {
    const map = COWMap.create<number>();
    const key1 = Symbol('key1');
    const key2 = Symbol('key2');

    map.set(key1, 42);
    const clonedMap = map.clone();

    clonedMap.set(key2, 84);

    expect(map.has(key2)).toBe(false);
    expect(clonedMap.has(key2)).toBe(true);
  });

  it('should not modify the original map when cloning', () => {
    const map = COWMap.create<number>();
    const key = Symbol('key');

    map.set(key, 42);
    const clonedMap = map.clone();

    clonedMap.set(Symbol('newKey'), 84);

    expect(map.get(key)).toBe(42);
    expect(clonedMap.get(key)).toBe(42);
  });
});

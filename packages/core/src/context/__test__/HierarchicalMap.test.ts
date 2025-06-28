import { describe, expect, it } from 'vitest';

import { HierarchicalMap } from '../HierarchicalMap.js';

describe('HierarchicalMap', () => {
  const symA = Symbol('A');
  const symB = Symbol('B');
  const symC = Symbol('C');

  it('should set and get own values', () => {
    const map = HierarchicalMap.create<string>();

    map.set(symA, 'valueA');

    expect(map.get(symA)).toBe('valueA');
    expect(map.has(symA)).toBe(true);
    expect(map.hasOwn(symA)).toBe(true);
    expect(map.hasInherited(symA)).toBe(false);
  });

  it('should return undefined for missing keys', () => {
    const map = HierarchicalMap.create<string>();

    expect(map.get(symA)).toBeUndefined();
    expect(map.has(symA)).toBe(false);
    expect(map.hasOwn(symA)).toBe(false);
    expect(map.hasInherited(symA)).toBe(false);
  });

  it('should inherit values from parent', () => {
    const parent = HierarchicalMap.create<string>();

    parent.set(symA, 'parentA');

    const child = parent.child();

    expect(child.get(symA)).toBe('parentA');
    expect(child.has(symA)).toBe(true);
    expect(child.hasOwn(symA)).toBe(false);
    expect(child.hasInherited(symA)).toBe(true);
  });

  it('should override inherited values with local values', () => {
    const parent = HierarchicalMap.create<string>();

    parent.set(symA, 'parentA');

    const child = parent.child();

    child.set(symA, 'childA');

    expect(child.get(symA)).toBe('childA');
    expect(child.has(symA)).toBe(true);
    expect(child.hasOwn(symA)).toBe(true);
    expect(child.hasInherited(symA)).toBe(false);
  });

  it('should reflect parent changes after child is created', () => {
    const parent = HierarchicalMap.create<string>();
    const child = parent.child();

    parent.set(symA, 'laterParentA');

    expect(child.get(symA)).toBe('laterParentA');
    expect(child.hasInherited(symA)).toBe(true);
  });

  it('should support deep inheritance', () => {
    const root = HierarchicalMap.create<string>();

    root.set(symA, 'rootA');

    const mid = root.child();
    const leaf = mid.child();

    expect(leaf.get(symA)).toBe('rootA');
    expect(leaf.hasInherited(symA)).toBe(true);
    expect(leaf.hasOwn(symA)).toBe(false);
  });

  it('should allow each level to shadow values independently', () => {
    const root = HierarchicalMap.create<string>();

    root.set(symA, 'rootA');

    const child = root.child();
    const grandchild = child.child();

    child.set(symA, 'childA');
    grandchild.set(symA, 'grandchildA');

    expect(root.get(symA)).toBe('rootA');
    expect(child.get(symA)).toBe('childA');
    expect(grandchild.get(symA)).toBe('grandchildA');

    expect(grandchild.hasOwn(symA)).toBe(true);
    expect(grandchild.hasInherited(symA)).toBe(false);
  });

  it('forEach should visit own and inherited keys once', () => {
    const root = HierarchicalMap.create<string>();

    root.set(symA, 'rootA');
    root.set(symB, 'rootB');

    const child = root.child();

    child.set(symB, 'childB'); // override
    child.set(symC, 'childC');

    const seen = new Map<symbol, string>();

    child.forEach((val, key) => seen.set(key, val));

    expect(seen.size).toBe(3);
    expect(seen.get(symA)).toBe('rootA');
    expect(seen.get(symB)).toBe('childB');
    expect(seen.get(symC)).toBe('childC');
  });

  it('forEach should not visit inherited values if shadowed locally', () => {
    const parent = HierarchicalMap.create<string>();

    parent.set(symA, 'parentA');

    const child = parent.child();

    child.set(symA, 'childA');

    const keys: symbol[] = [];

    child.forEach((_, k) => keys.push(k));

    expect(keys).toEqual([symA]);
  });

  it('forEach should not throw on empty map with no parent', () => {
    const map = HierarchicalMap.create<string>();
    const seen: symbol[] = [];

    map.forEach((_, k) => seen.push(k));
    expect(seen).toEqual([]);
  });

  it('should support multiple children sharing the same parent', () => {
    const root = HierarchicalMap.create<string>();

    root.set(symA, 'shared');

    const child1 = root.child();
    const child2 = root.child();

    expect(child1.get(symA)).toBe('shared');
    expect(child2.get(symA)).toBe('shared');

    child1.set(symA, 'c1');
    child2.set(symA, 'c2');

    expect(root.get(symA)).toBe('shared');
    expect(child1.get(symA)).toBe('c1');
    expect(child2.get(symA)).toBe('c2');
  });

  it('should return correct values after deep mutations', () => {
    const root = HierarchicalMap.create<string>();
    const child = root.child();
    const grandchild = child.child();

    root.set(symA, 'a');
    child.set(symB, 'b');
    grandchild.set(symC, 'c');

    expect(grandchild.get(symA)).toBe('a');
    expect(grandchild.get(symB)).toBe('b');
    expect(grandchild.get(symC)).toBe('c');

    expect(grandchild.hasInherited(symA)).toBe(true);
    expect(grandchild.hasInherited(symB)).toBe(true);
    expect(grandchild.hasOwn(symC)).toBe(true);
  });
});

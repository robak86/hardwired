import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useHasArrayChanged } from '../useHasArrayChanged.js';

describe('useHasArrayChanged', () => {
  it('should return false on first render', () => {
    const { result } = renderHook(useHasArrayChanged, { initialProps: [1, 2, 3] });

    expect(result.current).toBe(false);
  });

  it('should return false when array reference is the same', () => {
    const array = [1, 2, 3];
    const comparator = vi.fn().mockReturnValue(true);

    const { result, rerender } = renderHook(() => useHasArrayChanged(array, { comparator }));

    expect(result.current).toBe(false);

    // Rerender with the same hook call
    rerender();

    expect(result.current).toBe(false);
    expect(comparator).not.toHaveBeenCalled();
  });

  it('should return false when arrays are shallowly equal', () => {
    const initialArray = [1, 2, 3];

    const { result, rerender } = renderHook(({ items }) => useHasArrayChanged(items), {
      initialProps: { items: initialArray },
    });

    expect(result.current).toBe(false);

    // Rerender with a new array with the same values
    rerender({ items: [1, 2, 3] });

    expect(result.current).toBe(false);
  });

  it('should return true when arrays are different', () => {
    const { result, rerender } = renderHook(({ items }) => useHasArrayChanged(items), {
      initialProps: { items: [1, 2, 3] },
    });

    expect(result.current).toBe(false);

    // Rerender with different values
    rerender({ items: [1, 2, 4] });

    expect(result.current).toBe(true);
  });

  it('should use custom comparator correctly', () => {
    // Custom comparator that only compares ID properties
    const idComparator = (arr1: ReadonlyArray<{ id: number }>, arr2: ReadonlyArray<{ id: number }>) => {
      if (arr1 === arr2) return true;

      if (arr1.length !== arr2.length) return false;

      return arr1.every((item, index) => item.id === arr2[index].id);
    };

    const { result, rerender } = renderHook(({ items }) => useHasArrayChanged(items, { comparator: idComparator }), {
      initialProps: { items: [{ id: 1 }, { id: 2 }] },
    });

    expect(result.current).toBe(false);

    // Should not detect change with same IDs but different object references
    rerender({ items: [{ id: 1 }, { id: 2 }] });
    expect(result.current).toBe(false);

    // Should detect change with different IDs
    rerender({ items: [{ id: 1 }, { id: 3 }] });
    expect(result.current).toBe(true);
  });

  it('should work with rest parameters in a component', () => {
    // Test with same values but new array references
    const { result, rerender } = renderHook(useHasArrayChanged, { initialProps: [1, 2, 3] });

    expect(result.current).toBe(false);

    // Should not detect change with same values
    rerender([1, 2, 3]);
    expect(result.current).toBe(false);

    // Should detect change with different values
    rerender([1, 2, 4]);
    expect(result.current).toBe(true);
  });

  it('should handle object spread in components', () => {
    // Simulate the array we would get from Object.values after rest/spread
    const initialArray = ['Test', 42]; // [name, value]

    const { result, rerender } = renderHook(useHasArrayChanged, { initialProps: initialArray });

    expect(result.current).toBe(false);

    // Same values but new array reference (like Object.values on a new object)
    rerender(['Test', 42]);
    expect(result.current).toBe(false);

    // Changed value (like Object.values on a changed object)
    rerender(['Test', 43]);
    expect(result.current).toBe(true);
  });
});

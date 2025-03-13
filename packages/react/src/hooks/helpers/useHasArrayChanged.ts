import { useRef } from 'react';

import { isShallowEqual } from '../../utils/useMemoized.js';

type ArrayChangeDetectorOptions<T> = {
  comparator?: (prev: ReadonlyArray<T>, current: ReadonlyArray<T>) => boolean;
};

export function useHasArrayChanged<T>(items: ReadonlyArray<T>, options: ArrayChangeDetectorOptions<T> = {}): boolean {
  const { comparator = isShallowEqual } = options;

  // Store previous array values
  const previousItemsRef = useRef<ReadonlyArray<T> | null>(null);

  // Skip comparison if reference is the same (optimization)
  if (previousItemsRef.current === items) {
    return false;
  }

  // Nothing to compare if previous items don't exist yet (first render)
  if (previousItemsRef.current === null) {
    previousItemsRef.current = items;

    return false;
  }

  // Compare current and previous arrays
  const areEqual = comparator(previousItemsRef.current, items);

  // Store current items for next comparison
  previousItemsRef.current = items;

  // Return whether the array has changed
  return !areEqual;
}

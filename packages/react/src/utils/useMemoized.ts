import { useRef } from 'react';

export const isShallowEqual = (arr1: ReadonlyArray<any>, arr2: ReadonlyArray<any>) => {
  if (arr1 === arr2) {
    return true;
  }

  return arr1.length === arr2.length && arr1.every((val, idx) => val === arr2[idx]);
};

export type MemoizationKey = string | number | boolean;

export function useMemoized<T>(factory: () => T): (invalidateKeys: ReadonlyArray<any>) => T {
  const scopedContainer = useRef<{
    invalidationKeys: ReadonlyArray<MemoizationKey>;
    value: T | undefined;
  }>({ invalidationKeys: [], value: undefined });

  function getValue(keys: ReadonlyArray<MemoizationKey>) {
    const areKeysEqual = isShallowEqual(keys, scopedContainer.current.invalidationKeys);

    if (!areKeysEqual || !scopedContainer.current.value) {
      scopedContainer.current = { invalidationKeys: [...keys], value: factory() };
    }

    return scopedContainer.current.value!;
  }

  return getValue;
}

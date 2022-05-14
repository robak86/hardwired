import { useRef } from 'react';

export const isShallowEqual = (arr1: ReadonlyArray<any>, arr2: ReadonlyArray<any>) => {
  return arr1.length === arr2.length && arr1.every((val, idx) => val === arr2[idx]);
};

export type ExternalValues = Record<string, string | number | boolean>;

export const isShallowEqualRec = (obj1?: ExternalValues, obj2?: ExternalValues) => {
  const keys1 = Object.keys(obj1 || {});
  const keys2 = Object.keys(obj2 || {});

  if (keys1.length !== keys2.length) {
    return false;
  }

  const keys1Sorted = keys1.sort();
  const keys2Sorted = keys2.sort();

  return keys1Sorted.every((key, idx) => key === keys2Sorted[idx]);
};

export function useMemoized<T>(factory: () => T): (invalidateKeys: ReadonlyArray<any>) => T {
  const scopedContainer = useRef<{
    invalidationKeys: ReadonlyArray<any>;
    value: T | undefined;
  }>({ invalidationKeys: [], value: undefined });

  function getValue(keys: ReadonlyArray<any>) {
    const areKeysEqual = isShallowEqual(keys, scopedContainer.current.invalidationKeys);
    if (!areKeysEqual || !scopedContainer.current.value) {
      scopedContainer.current = { invalidationKeys: [...keys], value: factory() };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return scopedContainer.current.value!;
  }

  return getValue;
}

import { useRef } from 'react';

export type ExternalValues = Record<string, string | number | boolean>;

export const isShallowEqualRec = (obj1: ExternalValues = {}, obj2: ExternalValues = {}) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  const keys1Sorted = keys1.sort();

  return keys1Sorted.every(key => obj1[key] === obj2[key]);
};

export function useMemoizedByRec<T>(factory: () => T): (invalidateKeys?: ExternalValues) => T {
  const scopedContainer = useRef<{
    invalidationKeys?: ExternalValues;
    value: T | undefined;
  }>({ invalidationKeys: undefined, value: undefined });

  function getValue(keys?: ExternalValues) {
    const areKeysEqual = isShallowEqualRec(keys, scopedContainer.current.invalidationKeys);
    if (!areKeysEqual || !scopedContainer.current.value) {
      scopedContainer.current = { invalidationKeys: keys, value: factory() };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return scopedContainer.current.value!;
  }

  return getValue;
}

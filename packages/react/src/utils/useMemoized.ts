import { useRef } from 'react';

const shallowCompareArrays = (arr1: ReadonlyArray<any>, arr2: ReadonlyArray<any>) => {
  return arr1.length === arr2.length && arr1.every((val, idx) => val === arr2[idx]);
};

export function useMemoized<T>(factory: () => T): (invalidateKeys: ReadonlyArray<any>) => T {
  const scopedContainer = useRef<{
    invalidationKeys: ReadonlyArray<any>;
    container: T | undefined;
  }>({ invalidationKeys: [], container: undefined });

  function getValue(keys: ReadonlyArray<any>) {
    const areKeysEqual = shallowCompareArrays(keys, scopedContainer.current.invalidationKeys);
    if (!areKeysEqual || !scopedContainer.current.container) {
      scopedContainer.current = { invalidationKeys: [...keys], container: factory() };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return scopedContainer.current.container!;
  }

  return getValue;
}

import { useRef } from 'react';

const shallowCompareArrays = (arr1: ReadonlyArray<any>, arr2: ReadonlyArray<any>) => {
  return arr1.length === arr2.length && arr1.every((val, idx) => val === arr2[idx]);
};

export function useMemoized<T>(factory: () => T): (invalidateKeys: ReadonlyArray<any>) => T {
  const scopedContainer = useRef<{
    invalidationKeys: ReadonlyArray<any>;
    value: T | undefined;
  }>({ invalidationKeys: [], value: undefined });

  function getValue(keys: ReadonlyArray<any>) {
    const areKeysEqual = shallowCompareArrays(keys, scopedContainer.current.invalidationKeys);
    if (!areKeysEqual || !scopedContainer.current.value) {
      scopedContainer.current = { invalidationKeys: [...keys], value: factory() };
    }

    console.log('Using container', (scopedContainer as any).current.value.id);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return scopedContainer.current.value!;
  }

  return getValue;
}

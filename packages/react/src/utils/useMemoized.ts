import * as React from 'react';

export const isShallowEqual = (arr1: ReadonlyArray<any>, arr2: ReadonlyArray<any>) => {
  return arr1.length === arr2.length && arr1.every((val, idx) => val === arr2[idx]);
};

export function useMemoized<T>(factory: () => T): (invalidateKeys: ReadonlyArray<any>) => T {
  const scopedContainer = React.useRef<{
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

export type Contains<TItem, TArr extends any[]> = TItem extends TArr[number] ? true : false;

// prettier-ignore
export type FilterDuplicates<T> = T extends [] ? [] :
  T extends [ ...infer TRest, infer TItem] ?
    Contains<TItem, TRest> extends true ? FilterDuplicates<TRest> : [...FilterDuplicates<TRest>, TItem] : T

export const filterDuplicates = (items: any[]): any[] => {
  if (items.length < 2) {
    return items;
  }

  const [current] = items.slice(-1);
  const rest = items.slice(0, items.length - 1);

  if (rest.includes(current)) {
    return filterDuplicates(rest);
  } else {
    return [...filterDuplicates(rest), current];
  }
};

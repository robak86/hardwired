export type Reader<TFrom, TReturn> = {
  readonly id: string;
  get(from: TFrom): TReturn;
};

export const Reader = {
  // TODO: add currying
  run<TExtendTarget extends object, TFrom, TReturn>(
    reader: Reader<TFrom, TReturn>,
    target: TExtendTarget,
  ): TFrom & TExtendTarget {
    throw new Error('Implement me');
  },
};

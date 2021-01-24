export type IObservableList<TState, TIndex> = {
  getList(): TIndex[];
  getItem(key: TIndex): TState;
  subscribe(key: TIndex): void;
  notify(key: TIndex): void;
};

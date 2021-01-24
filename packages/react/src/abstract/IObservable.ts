export type CancelFunction = () => void;

export type IObservable<TState> = {
  readonly state: TState;
  subscribe<T>(callback: () => void, select?: (state: TState) => T): CancelFunction;
};

export function isObservable(value: any): value is IObservable<any> {
  return !!value.subscribe && value.state;
}

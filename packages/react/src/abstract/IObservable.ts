export type Unsubscribe = () => void;

export type IObservable<TState> = {
  subscribe(callback: (newValue: TState) => void): Unsubscribe;
};

export function isObservable(value: any): value is IObservable<any> {
  return !!value.subscribe;
}

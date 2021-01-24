export interface IObservable<TValue> {
  subscribe(): void;
  notify(): void;
}

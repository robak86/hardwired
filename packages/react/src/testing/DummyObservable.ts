import { IObservable, Unsubscribe } from '../abstract/IObservable';
import { noop } from '../utils/fp';

export class DummyObservable<TValue> implements IObservable<DummyObservable<TValue>> {
  private callbacks: any[] = [];

  constructor(public someValue: TValue) {}

  setValue(val: TValue) {
    this.someValue = val;
    this.callbacks.forEach(c => c(this));
  }

  subscribe(callback: (newValue: this) => void): Unsubscribe {
    callback(this);
    this.callbacks.push(callback);
    return noop;
  }
}

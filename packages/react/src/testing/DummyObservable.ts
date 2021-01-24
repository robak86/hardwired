import { CancelFunction, IObservable } from '../abstract/IObservable';
import { noop } from '../utils/basicFunctions';

export class DummyObservable<TValue> implements IObservable<TValue> {
  private callbacks: any[] = [];
  constructor(public readonly state: TValue) {}

  subscribe(callback): CancelFunction {
    this.callbacks.push(callback);
    return noop;
  }

  setValue(val: TValue) {
    (this as any).state = val;
    this.callbacks.forEach(c => c());
  }
}

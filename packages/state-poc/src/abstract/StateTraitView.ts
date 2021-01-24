import { IObservable } from './IObservable';

export abstract class StateTraitView<TState, TReturn> {
  constructor(private stateTrait: IObservable<TState>) {

  }

  abstract get(): TReturn;
}

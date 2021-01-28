import { IObservable, Unsubscribe } from '../abstract/IObservable';

// TODO: reflects react class component's state
export class ComponentState<TState> implements IObservable<TState> {
  constructor(public readonly state) {}

  setState(newState: TState) {}

  subscribe(): Unsubscribe {
    throw new Error('implement me');
  }
}

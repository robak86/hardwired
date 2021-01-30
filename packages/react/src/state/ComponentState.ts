import { IObservable, Unsubscribe } from '../abstract/IObservable';

export abstract class ComponentState<TState> implements IObservable<TState> {
  private listeners: Array<(event: TState) => void> = [];
  abstract state: TState;

  protected setState(newState: TState);
  protected setState(callback: (prevState: TState) => TState);
  protected setState(callbackOrNewState: unknown) {
    const newState = typeof callbackOrNewState === 'function' ? callbackOrNewState(this.state) : callbackOrNewState;
    this.state = newState;
    this.listeners.forEach(listener => listener(newState));
  }

  subscribe(callback: (value: TState) => void): Unsubscribe {
    callback(this.state);
    this.listeners.push(callback);

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
}

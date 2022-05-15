import { makeAutoObservable } from 'mobx';
import { CounterStore } from './CounterStore.js';

export class CounterActions {
  constructor(private store: CounterStore) {
    makeAutoObservable(this);
  }

  increment = () => {
    this.store.value += 1;
  };

  decrement = () => {
    this.store.value -= 1;
  };
}

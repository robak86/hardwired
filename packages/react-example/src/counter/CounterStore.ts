import { makeAutoObservable } from 'mobx';

export class CounterStore {
  constructor(public value: number, public label: string) {
    makeAutoObservable(this);
  }
}


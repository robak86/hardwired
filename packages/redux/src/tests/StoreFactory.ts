import { Factory } from '@hardwired/core';
import { createStore, Reducer, Store } from 'redux';

export type AppState = {
  value: string
};

export class StoreFactory implements Factory<Store<AppState>> {
  constructor(private rootReducer: Reducer<AppState>, private defaultState: AppState) {}

  build(): Store<AppState> {
    return createStore<AppState, any, any, any>(this.rootReducer, this.defaultState);
  }
}

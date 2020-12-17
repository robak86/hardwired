import { Factory, factory, module, value } from '@hardwired/core';
import { rootReducer } from './rootReducer';
import { createStore, Reducer, Store } from 'redux';
import { AppState } from './AppState';

class StoreFactory implements Factory<Store<AppState>> {
  constructor(private rootReducer: Reducer<AppState>, private defaultState: AppState) {}

  build(): Store {
    return createStore<AppState, any, any, any>(this.rootReducer, this.defaultState);
  }
}

export const storeModule = module('app')
  .define('initialState', value({ value: 'initialValue' }))
  .define('rootReducer', value(rootReducer))
  .define('store', factory(StoreFactory), ['rootReducer', 'initialState']);

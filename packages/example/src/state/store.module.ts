import { Factory, factory, Module, module, value } from 'hardwired';
import { rootReducer } from './rootReducer';
import { applyMiddleware, compose, createStore, Reducer, Store } from 'redux';
import { AppState } from './AppState';
import { NodesState } from '../nodes/state/NodesState';
import { composeWithDevTools } from 'redux-devtools-extension';
import { selectState } from 'hardwired-redux';

class StoreFactory implements Factory<Store<AppState>> {
  constructor(private rootReducer: Reducer<AppState>, private defaultState: AppState) {}

  build(): Store {
    const enhancersCompose: any = process.env.NODE_ENV === 'production' ? _ => _ : composeWithDevTools;
    const enhancers = [enhancersCompose(applyMiddleware())];
    return createStore<AppState, any, any, any>(this.rootReducer, this.defaultState, compose(...enhancers));
  }
}

class InitialStateFactory implements Factory<AppState> {
  build(): AppState {
    return {
      ...NodesState.build(),
    };
  }
}

export const storeModule = module('app')
  .define('initialState', factory(InitialStateFactory))
  .define('rootReducer', value(rootReducer))
  .define('store', factory(StoreFactory), ['rootReducer', 'initialState'])
  .define('state', selectState<AppState>(), ['store']);

export type M = Module.Materialized<typeof storeModule>;
type W = M['state'];

import { applyMiddleware, compose, createStore, Reducer, Store } from 'redux';
import { AppState } from './AppState';
import { composeWithDevTools } from 'redux-devtools-extension';

export const createAppStore = (rootReducer: Reducer<AppState>, defaultState: AppState): Store<AppState> => {
  const enhancersCompose: any = process.env.NODE_ENV === 'production' ? _ => _ : composeWithDevTools;
  const enhancers = [enhancersCompose(applyMiddleware())];
  return createStore<AppState, any, any, any>(rootReducer, defaultState, compose(...enhancers));
};

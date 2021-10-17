import { combineReducers, Reducer } from 'redux';
import { AppState } from './AppState';
import { nodesReducer } from '../nodes/reducers/nodesReducer';

export const appReducer: Reducer<AppState> = combineReducers<AppState>({
  nodes: nodesReducer,
});

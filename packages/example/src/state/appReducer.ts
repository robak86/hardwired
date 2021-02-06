import { combineReducers } from 'redux';
import { AppState } from './AppState';
import { nodesReducer } from '../nodes/reducers/nodesReducer';

export const appReducer = combineReducers<AppState>({
  nodes: nodesReducer,
});

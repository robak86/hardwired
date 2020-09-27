import { combineReducers } from 'redux';
import { AppState } from './AppState';
import { matrixReducer } from '../matrix/reducers/matrixReducer';

export const rootReducer = combineReducers<AppState>({
  matrix: matrixReducer,
  value: (v = 'strig') => v,
});

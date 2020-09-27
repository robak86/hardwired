import { init } from 'hardwired-redux';
import { AppState } from './AppState';

export const { store, reducer, dispatch, selector } = init<AppState>();

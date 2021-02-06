import { module } from 'hardwired';
import { appReducer } from './appReducer';
import { AppState } from './AppState';
import { createAppStore } from './store';

export const storeModule = module()
  .define('initialState', () => AppState.build())
  .define('appReducer', () => appReducer)
  .define('store', m => createAppStore(m.appReducer, m.initialState))
  .build();

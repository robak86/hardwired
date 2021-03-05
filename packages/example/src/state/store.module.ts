import { module } from 'hardwired';
import { appReducer } from './appReducer';
import { AppState } from './AppState';
import { createAppStore } from './store';
import { AnyAction, Store } from 'redux';

const dispatchAction = (store: Store<any>) => <TPayload, TAction extends AnyAction>(
  actionCreator: (payload: TPayload) => TAction,
): ((payload: TPayload) => void) => {
  return (payload: TPayload) => store.dispatch(actionCreator(payload));
};

export const storeModule = module()
  .define('initialState', () => AppState.build())
  .define('appReducer', () => appReducer)
  .define('store', m => createAppStore(m.appReducer, m.initialState))
  .define('boundAction', ({ store }) => dispatchAction(store))
  .build();

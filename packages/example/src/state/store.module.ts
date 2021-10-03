import { AppState } from './AppState';
import { createAppStore } from './store';
import { AnyAction, Store } from 'redux';
import { singleton } from 'hardwired';
import { appReducer as appReducerImpl } from './appReducer';


const dispatchAction =
  (store: Store<any>) =>
  <TPayload, TAction extends AnyAction>(
    actionCreator: (payload: TPayload) => TAction,
  ): ((payload: TPayload) => void) => {
    return (payload: TPayload) => store.dispatch(actionCreator(payload));
  };

const initialState = singleton.fn(() => AppState.build());
const appReducer = singleton.fn(() => appReducerImpl);
const store = singleton.fn((reducer, state) => createAppStore(reducer, state), [appReducer, initialState]);
const boundAction = singleton.fn(store => dispatchAction(store), [store]);

const storeModule = {
  initialState,
  appReducer,
  store,
  boundAction,
};

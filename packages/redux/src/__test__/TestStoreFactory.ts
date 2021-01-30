import { factory, Factory, value } from 'hardwired';
import { createStore, Reducer, Store } from 'redux';
import { unit } from '../../../core/src/module/ModuleBuilder';
import { reduxFor } from '../reduxFor';

export type AppState = {
  value: string;
  count: number;
};

export class TestStoreFactory implements Factory<Store<AppState>> {
  constructor(private rootReducer: Reducer<AppState>, private defaultState: AppState) {}

  build(): Store<AppState> {
    return createStore<AppState, any, any, any>(this.rootReducer, this.defaultState);
  }
}

const updateReducer = (state, action): AppState => {
  if (action.type === 'updateValue') {
    return { ...state, value: 'updated' };
  }

  if (action.type === 'incCounter') {
    return { ...state, count: state.count + 1 };
  }

  return state;
};

const selectStateValue = (state: AppState) => state.value;
const selectStateCount = (state: AppState) => state.count;
const toUpperCase = (s: string) => s.toUpperCase();
export const updateAction = (newValue: string) => ({ type: 'updateValue', newValue });
export const incCounter = () => ({ type: 'incCounter' });

export const reduxModule = unit('reduxModule')
  .define('initialState', value({ value: 'initialValue', count: 0 }))
  .define('rootReducer', value(updateReducer))
  .define('store', factory(TestStoreFactory), ['rootReducer', 'initialState']);

export const { dispatch, useSelector, selector } = reduxFor(reduxModule, 'store');

export const selectorsModule = unit('selectors')
  .define('updateValue', dispatch(updateAction))
  .define('selectStateValue', selector(selectStateValue))
  .define('selectStateCount', selector(selectStateCount))
  .define('compositeSelector', selector(toUpperCase), ['selectStateValue'])
  .define(
    'uberCompositeSelector',
    selector((arg1, arg2) => arg1 + '_' + arg2),
    ['selectStateValue', 'compositeSelector'],
  );

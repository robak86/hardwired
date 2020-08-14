import { container, func, module, moduleImport, value } from '@hardwired/core';
import { reducer } from '../factories/ReducerResolver';
import { store } from '../factories/StoreResolver';

describe(`Integration tests`, () => {
  type AppState = {
    userName: string;
  };

  describe(`registering reducers`, () => {
    describe(`no lazy loading`, () => {
      function setup() {
        const appReducer1 = jest.fn().mockImplementation(state => state);
        const appReducer2 = jest.fn().mockImplementation(state => state);

        const defaultState = { userName: 'Tomasz' };

        const childModule = module('childModule').define('appReducer2', _ => reducer(appReducer2));

        const m = module('m')
          .define('childStoreModule', _ => moduleImport(childModule))
          .define('defaultState', _ => value(defaultState))
          .define('store', _ => store(_.defaultState))
          .define('appReducer1', _ => reducer(appReducer1));

        const c = container(m);

        return { container: c, appReducer1, appReducer2, defaultState };
      }

      it(`calls reducers with correct params`, async () => {
        const { container, appReducer1, appReducer2, defaultState } = setup();
        const { store } = container.asObject();

        expect(store.getState()).toEqual(defaultState);

        const action = { type: 'SOME_TYPE' };
        store.dispatch(action);

        expect(appReducer1).toBeCalledWith(defaultState, action);
        expect(appReducer2).toBeCalledWith(defaultState, action);
      });
    });
  });
});

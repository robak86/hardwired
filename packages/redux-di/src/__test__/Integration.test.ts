import { container, module, value } from 'hardwired';
import { reducer } from '../resolvers/ReducerResolver';
import { store } from '../resolvers/StoreResolver';

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

        const childModule = module('childModule').define('appReducer2', reducer(appReducer2));

        const m = module('m')
          .define('childStoreModule', childModule)
          .define('defaultState', value(defaultState))
          .define('store', store(), ['defaultState'])
          .define('appReducer1', reducer(appReducer1));

        const c = container(m);

        return { container: c, appReducer1, appReducer2, defaultState };
      }

      it.todo(`calls reducers with correct params`, async () => {
        // const { container, appReducer1, appReducer2, defaultState } = setup();
        // const { store } = container.asObject();
        //
        // expect(store.getState()).toEqual(defaultState);
        //
        // const action = { type: 'SOME_TYPE' };
        // store.dispatch(action);
        //
        // expect(appReducer1).toBeCalledWith(defaultState, action);
        // expect(appReducer2).toBeCalledWith(defaultState, action);
      });
    });
  });
});

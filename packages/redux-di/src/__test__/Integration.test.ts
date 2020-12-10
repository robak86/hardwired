import { container, module, value } from 'hardwired';
import { store } from '../resolvers/StoreResolver';
import { init } from '../resolvers/StateTypedResolverts';

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

        const { reducer } = init<typeof defaultState>();

        const childModule = module('childModule').define('appReducer2', reducer(appReducer2));

        const root = module('m')
          .define('childStoreModule', childModule)
          .define('defaultState', value(defaultState))
          .define('store', store(), ['defaultState'])
          .define('appReducer1', reducer(appReducer1))
          .define('appReducer2', reducer(appReducer2));

        const c = container();

        return { container: c, appReducer1, appReducer2, defaultState, root };
      }

      it(`calls reducers with correct params`, async () => {
        const { container, appReducer1, appReducer2, defaultState, root } = setup();
        const store = container.get(root, 'store');

        expect(store.getState()).toEqual(defaultState);

        const action = { type: 'SOME_TYPE' };
        store.dispatch(action);

        expect(appReducer1).toBeCalledWith(defaultState, action);
        expect(appReducer2).toBeCalledWith(defaultState, action);
      });
    });
  });
});

import { container, factory, module, value } from 'hardwired';
import { AppState, StoreFactory } from '../tests/StoreFactory';
import { storeFactory } from '../resolvers/StoreFactory';

describe(`Integration tests`, () => {
  describe(`registering reducers`, () => {
    it.todo('TODO');

    // describe(`no lazy loading`, () => {
    //   function setup() {
    //     const appReducer1 = jest.fn().mockImplementation((state: AppState, action) => state);
    //
    //     const defaultState = { value: 'Tomasz' };
    //
    //     const root = module('m')
    //       .define('defaultState', value(defaultState))
    //       .define('appReducer1', value(appReducer1))
    //       .define('store', storeFactory(StoreFactory), ['appReducer1', 'defaultState']);
    //
    //     const c = container();
    //
    //     return { container: c, appReducer1, defaultState, root };
    //   }
    //
    //   it(`calls reducers with correct params`, async () => {
    //     const { container, appReducer1, defaultState, root } = setup();
    //     const store = container.get(root, 'store');
    //
    //     expect(store.getState()).toEqual(defaultState);
    //
    //     const action = { type: 'SOME_TYPE' };
    //     store.dispatch(action);
    //
    //     expect(appReducer1).toBeCalledWith(defaultState, action);
    //   });
    // });
  });
});

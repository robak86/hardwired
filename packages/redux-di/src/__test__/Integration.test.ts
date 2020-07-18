import { container, module } from '@hardwired/di-core';

import { reduxDefines } from '../builders/ReduxDefines';

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

        const childModule = module('childModule').using(reduxDefines<AppState>()).reducer('appReducer2', appReducer2);

        const m = module('m')
          .import('childStoreModule', childModule)
          .function('defaultState', () => defaultState)
          .using(reduxDefines<AppState>())
          .store('store', ({ defaultState }) => defaultState())
          .reducer('appReducer1', appReducer1);

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

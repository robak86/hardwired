import { AlterableStore } from '../AlterableStore';
import createSagaMiddleware from 'redux-saga';

describe(`StoreInstance`, () => {
  function setup() {
    const state = { defaultState: 1 };
    const store = new AlterableStore(state);
    const action = { type: 'SOME_ACTION_TYPE' };

    return { state, store, action };
  }

  it(`works`, async () => {
    const { state, store, action } = setup();
    const newState = { defaultState: 2 };
    const reducer = jest.fn().mockReturnValue(newState);

    store.replaceReducers([reducer]);

    store.dispatch(action);
    expect(reducer).toBeCalledWith(state, action);
  });

  it(`allows for dynamic middleware registration`, async () => {
    const { state, store, action } = setup();

    function* test<TValue>(value: TValue) {
      return value;
    }

    const effectMiddleware = next => effect => {
      console.log(effect);

      return next(effect);
    };

    function* helloSaga() {
      const wtf = yield* test('123');
      console.log('Hello Sagas!', wtf);
    }

    function* helloSaga2() {
      console.log('Hello Sagas!');
      yield { wtf: 1 };
    }

    const sagaMiddleware = createSagaMiddleware({ effectMiddlewares: [effectMiddleware] });
    store.replaceMiddleware([sagaMiddleware]);
    store.replaceMiddleware([sagaMiddleware]);

    sagaMiddleware.run(helloSaga);
    sagaMiddleware.run(helloSaga2);

    store.dispatch(action);
  });
});

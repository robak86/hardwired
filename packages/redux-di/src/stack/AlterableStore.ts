import { compose, createStore, Dispatch, Middleware, Reducer, Store } from 'redux';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';

export class AlterableStore<AppState> {
  private middlewares: ReturnType<Middleware>[] = [];
  private reducers: Reducer<AppState>[] = [];
  private store: Store<AppState>;
  private sagaMiddleware: SagaMiddleware;

  public dispatch: Dispatch<any>;
  public getState: () => AppState;

  constructor(defaultState: AppState) {
    this.store = createStore<AppState, any, any, any>(this.appReducer, defaultState as any, this.storeEnhancer);
    this.sagaMiddleware = createSagaMiddleware({ effectMiddlewares: [] });
    this.dispatch = this.store.dispatch;
    this.getState = this.store.getState;
  }

  // TODO: investigate if we shouldn't mirror some init behavior specific to combineReducers
  replaceReducers(reducers: Reducer<AppState, any>[]) {
    this.reducers = reducers;
    // this.store.replaceReducer(this.appReducer);
  }

  replaceMiddleware(middlewares: Middleware[]) {
    let dispatch: any = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.',
      );
    };

    const middlewareAPI = {
      getState: this.getState,
      dispatch: dispatch,
    };

    this.middlewares = middlewares.map(m => m(middlewareAPI));
  }

  private appReducer: Reducer<AppState> = (state: AppState, action) => {
    return this.reducers.reduce((currentState, reducer) => reducer(currentState, action), state);
  };

  private storeEnhancer = createStore => (...args) => {
    const store = createStore(...args);

    return {
      ...store,
      dispatch: action => {
        const dispatchComposed: any = compose(...this.middlewares)(store.dispatch);
        return dispatchComposed(action);
      },
    };
  };
}

import { compose, createStore, Dispatch, Middleware, Reducer, Store, StoreEnhancer } from 'redux';

export class StoreInstance<AppState> {
  private middlewares: ReturnType<Middleware>[] = [];
  private reducers: Reducer<AppState>[] = [];
  private store: Store<AppState>;

  public dispatch: Dispatch<any>;
  public getState: () => AppState;

  constructor(defaultState: AppState) {
    this.store = createStore<AppState, any, any, any>(this.appReducer, defaultState as any, this.storeEnhancer);
    this.dispatch = this.store.dispatch;
    this.getState = this.store.getState;
  }

  appendReducer(reducer: Reducer<AppState, any>) {
    this.reducers.push(reducer);
  }

  appendMiddleware(middleware: Middleware) {
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

    this.middlewares.push(middleware(middlewareAPI));
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

import { SelectorResolver, SelectorResolverParams } from './resolvers/SelectorResolver';
import { Action, Reducer } from 'redux';
import { ReducerResolver } from './resolvers/ReducerResolver';
import { DispatchResolver, DispatchResolverParams } from './resolvers/DispatchResolver';
import { Instance } from 'hardwired';
import { StoreResolver } from './resolvers/StoreResolver';

export function init<TState extends Record<string, unknown>, TAction extends Action = any>() {
  const selector: SelectorResolverParams<TState> = (select, deps?) => {
    return new SelectorResolver(select, deps) as any;
  };

  const reducer = (reducer: Reducer<TState, any>): ReducerResolver<TState> => {
    return new ReducerResolver(reducer) as any;
  };

  const dispatch: DispatchResolverParams<TAction> = actionCreator => {
    return new DispatchResolver(actionCreator);
  };

  const store = <TState>(defaultsState: Instance<TState>): StoreResolver<TState> => {
    return new StoreResolver<TState>(defaultsState);
  };

  return {
    selector,
    reducer,
    dispatch,
    store,
  };
}

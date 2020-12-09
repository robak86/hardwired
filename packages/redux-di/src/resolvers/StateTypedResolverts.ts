import { Action, Reducer } from 'redux';
import { SelectorResolver, SelectorResolverParams } from './SelectorResolver';
import { ReducerResolver } from './ReducerResolver';
import { DispatchResolver, DispatchResolverParams } from './DispatchResolver';
import { StoreResolver } from './StoreResolver';
import { Instance } from 'hardwired';
import { AlterableStore } from '../stack/AlterableStore';

export function init<TState extends Record<string, unknown>, TAction extends Action = any>() {
  const selector: SelectorResolverParams<TState> = select => {
    return new SelectorResolver(select);
  };

  const reducer = (reducer: Reducer<TState, TAction>): Instance<Reducer<TState, TAction>, []> => {
    return new ReducerResolver(reducer);
  };

  const dispatch: DispatchResolverParams<TAction> = actionCreator => {
    return new DispatchResolver(actionCreator);
  };

  const store = <TState>(): Instance<AlterableStore<TState>, [TState]> => {
    return new StoreResolver<TState>();
  };

  return {
    selector,
    reducer,
    dispatch,
    store,
  };
}

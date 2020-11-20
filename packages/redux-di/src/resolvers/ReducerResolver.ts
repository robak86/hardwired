import { ValueResolver } from 'hardwired';
import { Reducer } from 'redux';

export class ReducerResolver<TReturn> extends ValueResolver<TReturn> {

}

// TODO: make it typesafe
export const reducer = (reducer: Reducer<any, any>): ReducerResolver<any> => {
  return new ReducerResolver(reducer);
};

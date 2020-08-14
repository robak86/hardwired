import { ValueResolver } from '@hardwired/core';
import { Reducer } from 'redux';

export class ReducerResolver<TReturn> extends ValueResolver<TReturn> {}

// TODO: make it typesafe
export const reducer = (reducer: Reducer<any, any>): ReducerResolver<any> => {
  return new ReducerResolver(reducer);
};

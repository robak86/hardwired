import { PathDefinition, QueryParamsDefinition } from '@roro/routing-core';
import { HttpMethod } from '../HttpMethod';

// TODO: consider renaming to ClientRouteDefinition

export type QueryRouteDefinition<TPayload extends object, TResult> = {
  type: 'query';
} & PathDefinition<Partial<TPayload>> & // TODO: Partial<TPayload> is not the best type :/
  QueryParamsDefinition<Partial<TPayload>> & {
    httpMethod: HttpMethod;
  };

//
// type T1 = {
//   t1: number;
//   t2: number;
// };
//
// type T2 = {
//   result: number;
// };
//
// const route = createCommandRoute<T2, T1>(HttpMethod.POST, '/a').mapParams(['result'], []);

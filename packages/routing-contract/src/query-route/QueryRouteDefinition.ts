import { QueryParamsDefinition } from '@roro/routing-core/lib/query-params-definition/QueryParamsDefinition';
import { PathDefinition } from '@roro/routing-core/lib/path-definition/PathDefinition';
import { HttpMethod } from '../HttpMethod';
import { createCommandRoute } from '../command-route/createCommandRoute';

// TODO: consider renaming to ClientRouteDefinition
// prettier-ignore
export type QueryRouteDefinition<TPayload extends object, TResult> = 
  PathDefinition<Partial<TPayload>> &   // TODO: Partial<TPayload> is not the best type :/
  QueryParamsDefinition<Partial<TPayload>> & {
    httpMethod: HttpMethod
  }

type T1 = {
  t1: number;
  t2: number;
};

type T2 = {
  result: number;
};

const route = createCommandRoute<T2, T1>(HttpMethod.POST, '/a').mapParams(['result'], []);

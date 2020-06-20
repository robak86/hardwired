import { toUrl } from './toUrl';
import { join } from './join';
import { build } from './build';
import { ParsedQuery, PathDefinition, QueryParamsDefinition } from '@roro/routing-core';
import { RouteParams } from './routeTypes';

export type RouteDefinition<TPathParams extends {}, TQueryParams extends ParsedQuery> = PathDefinition<TPathParams> &
  QueryParamsDefinition<TQueryParams> & {
    defaultRouteParams?: RouteParams<TPathParams, TQueryParams>;
    queryParamsStringify?: (params: TQueryParams) => string;
  };

export const RouteDefinition = {
  build,
  toUrl,
  join,
  toPath: (route: RouteDefinition<any, any>) => route.pathDefinition,
};

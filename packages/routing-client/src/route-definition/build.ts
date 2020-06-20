import { RouteDefinition } from './RouteDefinition';
import { ParsedQuery, PathDefinition, QueryParamsDefinition } from '@roro/routing-core';
import { RouteParamsArg } from './routeTypes';

export type RouteDefinitionBuildParams<TPathParams, TQueryParams extends ParsedQuery> = {
  defaultRouteParams?: Partial<RouteParamsArg<TPathParams, TQueryParams>>;
  queryParamsStringify?: (params: TQueryParams) => string;
};

export const build = <TPathParams extends object = {}, TQueryParams extends ParsedQuery = {}>(
  definition,
  config?: RouteDefinitionBuildParams<TPathParams, TQueryParams>,
): RouteDefinition<TPathParams, TQueryParams> => {
  return {
    ...PathDefinition.build<TPathParams>(definition),
    ...QueryParamsDefinition.build<TQueryParams>({}), //TODO: use correct defaults params
  };
};

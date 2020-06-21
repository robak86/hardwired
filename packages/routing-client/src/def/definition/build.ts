import { ParsedQuery } from '@roro/routing-core';
import { RouteParamsArg } from '../utils/routeTypes';
import { RouteDefinition } from '../RouteDefinition';

export type RouteDefinitionBuildParams<TPathParams, TQueryParams extends ParsedQuery> = {
  defaultRouteParams?: Partial<RouteParamsArg<TPathParams, TQueryParams>>;
  queryParamsStringify?: (params: TQueryParams) => string;
};

export const build = <TPathParams = {}, TQueryParams extends ParsedQuery = {}>(
  definition,
  config?: RouteDefinitionBuildParams<TPathParams, TQueryParams>,
): RouteDefinition<TPathParams, TQueryParams> => {
  return {
    definition,
    defaultRouteParams: config?.defaultRouteParams as any,
    queryParamsStringify: config?.queryParamsStringify,
  };
};

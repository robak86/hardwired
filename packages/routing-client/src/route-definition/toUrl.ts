import { RouteDefinition } from './RouteDefinition';
import { ParsedQuery } from '@roro/routing-core';
import { BuildUrlRouteParamsArg } from './routeTypes';

export function toUrl<TPathParams, TQueryParams extends ParsedQuery>(
  route: RouteDefinition<TPathParams, TQueryParams>,
  ...params: BuildUrlRouteParamsArg<TPathParams, TQueryParams>
): string {
  throw new Error('implement me');
  // const { pathParams = {}, queryParams = {} } = (params[0] || {}) as any;
  // const { defaultRouteParams, queryParamsStringify = queryParamsImpl.stringify } = route;
  // const pathParamsWithDefaults = R.mergeDeepRight(defaultRouteParams?.pathParams || {}, pathParams);
  // const queryParamsWithDefaults = R.mergeDeepRight(defaultRouteParams?.queryParams || {}, queryParams);
  //
  // const pathFunction = compilePathDefinition(route.pathDefinition);
  // const pathUrl = pathFunction(pathParamsWithDefaults);
  // const hasQueryParams = Object.keys(queryParamsWithDefaults).length > 0;
  // const queryUrl = hasQueryParams ? `?${queryParamsStringify(queryParamsWithDefaults)}` : '';
  //
  // return joinURL(pathUrl, queryUrl);
}

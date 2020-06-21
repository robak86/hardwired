import { ParsedQuery } from '@roro/routing-core';

import { BuildUrlRouteParamsArg } from '../utils/routeTypes';
import * as R from 'ramda';
import { compilePathDefinition } from '../utils/compilePathDefinition';
import joinURL from 'url-join';
import { RouteDefinition } from '../RouteDefinition';
import { stringify } from 'qs';

export function toUrl<TPathParams, TQueryParams extends ParsedQuery>(
  route: RouteDefinition<TPathParams, TQueryParams>,
  ...params: BuildUrlRouteParamsArg<TPathParams, TQueryParams>
): string {
  const { pathParams = {}, queryParams = {} } = (params[0] || {}) as any;
  const { defaultRouteParams, queryParamsStringify = stringify } = route;
  const pathParamsWithDefaults = R.mergeDeepRight(defaultRouteParams?.pathParams || {}, pathParams);
  const queryParamsWithDefaults = R.mergeDeepRight(defaultRouteParams?.queryParams || {}, queryParams);

  const pathFunction = compilePathDefinition(route.definition);
  const pathUrl = pathFunction(pathParamsWithDefaults);
  const hasQueryParams = Object.keys(queryParamsWithDefaults).length > 0;
  const queryUrl = hasQueryParams ? `?${queryParamsStringify(queryParamsWithDefaults)}` : '';

  return joinURL(pathUrl, queryUrl);
}

import { toUrl } from './definition/toUrl';
import { join } from './definition/join';
import { build } from './definition/build';
import { ParsedQuery } from '@roro/routing-core';

import { RouteParams } from './utils/routeTypes';

export type RouteDefinition<TPathParams extends {}, TQueryParams extends ParsedQuery> = {
  definition: string;
  defaultRouteParams?: RouteParams<TPathParams, TQueryParams>;
  queryParamsStringify?: (params: TQueryParams) => string;
};

export const RouteDefinition = {
  build,
  toUrl,
  join,
  toPath: (route: RouteDefinition<any, any>) => route.definition,
};

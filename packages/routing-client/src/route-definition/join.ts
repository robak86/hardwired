import joinURL from 'url-join';

import { RouteDefinition } from './RouteDefinition';
import { ParsedQuery } from '@roro/routing-core';

type JoinFn = {
  <TPathParams1, TQueryParams1 extends ParsedQuery, TPathParams2, TQueryParams2 extends ParsedQuery>(
    route1: RouteDefinition<TPathParams1, TQueryParams1>,
    route2: RouteDefinition<TPathParams2, TQueryParams2>,
  ): RouteDefinition<TPathParams1 & TPathParams2, TQueryParams1 & TQueryParams2>;

  <
    TPathParams1,
    TQueryParams1 extends ParsedQuery,
    TPathParams2,
    TQueryParams2 extends ParsedQuery,
    TPathParams3,
    TQueryParams3 extends ParsedQuery
  >(
    route1: RouteDefinition<TPathParams1, TQueryParams1>,
    route2: RouteDefinition<TPathParams2, TQueryParams2>,
    route3: RouteDefinition<TPathParams3, TQueryParams3>,
  ): RouteDefinition<TPathParams1 & TPathParams2 & TPathParams3, TQueryParams1 & TQueryParams2 & TQueryParams3>;

  <
    TPathParams1,
    TQueryParams1 extends ParsedQuery,
    TPathParams2,
    TQueryParams2 extends ParsedQuery,
    TPathParams3,
    TQueryParams3 extends ParsedQuery,
    TPathParams4,
    TQueryParams4 extends ParsedQuery
  >(
    route1: RouteDefinition<TPathParams1, TQueryParams1>,
    route2: RouteDefinition<TPathParams2, TQueryParams2>,
    route3: RouteDefinition<TPathParams3, TQueryParams3>,
    route4: RouteDefinition<TPathParams4, TQueryParams4>,
  ): RouteDefinition<
    TPathParams1 & TPathParams2 & TPathParams3 & TPathParams4,
    TQueryParams1 & TQueryParams2 & TQueryParams3 & TQueryParams4
  >;

  (...args: any[]): RouteDefinition<never, never>;
};

export const join: JoinFn = (...args: any[]): any => {
  const paths = args.map(RouteDefinition.toPath);
  return RouteDefinition.build(joinURL(...paths));
};

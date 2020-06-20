import { HttpMethod } from '../HttpMethod';

import { PathDefinition, QueryParamsDefinition } from '@roro/routing-core';
import { CommandRouteDefinitionMappingGuard } from '../utils/PayloadMappingGuard';

export function createCommandRoute<TPayload extends object, TResult extends object>(
  httpMethod: HttpMethod,
  path: string,
) {
  return {
    mapParams<TPathParamsKeys extends keyof TPayload, TQueryParamsKeys extends keyof TPayload>(
      pathParams: TPathParamsKeys[],
      queryParams: TQueryParamsKeys[],
    ): CommandRouteDefinitionMappingGuard<TPathParamsKeys, TQueryParamsKeys, TPayload, TResult> {
      const queryParamsDefinition: QueryParamsDefinition<Record<
        TQueryParamsKeys,
        TPayload
      >> = QueryParamsDefinition.buildMappable<Record<TQueryParamsKeys, TPayload>>(queryParams, {});

      const pathDefinition: PathDefinition<Record<TPathParamsKeys, TPayload>> = PathDefinition.buildMappable<
        Record<TPathParamsKeys, TPayload>
      >(path, pathParams);

      return {
        ...queryParamsDefinition,
        ...pathDefinition,
        httpMethod,
      } as any; // required casting to overcome conditional types
    },
  };
}

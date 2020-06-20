import { HttpMethod } from '../HttpMethod';
import { PathDefinition, QueryParamsDefinition } from '@roro/routing-core';
import { QueryRouteDefinitionMappingGuard } from '../utils/PayloadMappingGuard';

export function createQueryRoute<TPayload extends object, TResult extends object>(
  httpMethod: HttpMethod, // TODO: add defaults fro query params
  path: string,
) {
  return {
    mapParams<TPathParamsKeys extends keyof TPayload, TQueryParamsKeys extends keyof TPayload>(
      pathParams: Array<TPathParamsKeys>,
      queryParams: Array<TQueryParamsKeys>,
    ): QueryRouteDefinitionMappingGuard<TPathParamsKeys, TQueryParamsKeys, TPayload, TResult> {
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

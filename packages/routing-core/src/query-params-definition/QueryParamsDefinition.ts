import { ParsedQuery, queryParams as queryParamsImpl } from './queryParams';

export type MappableQueryParamsDefinition<TQueryParams extends ParsedQuery> = QueryParamsDefinition<TQueryParams> & {
  queryParamsKeys: Array<keyof TQueryParams>;
};

export type QueryParamsDefinition<TQueryParams extends ParsedQuery> = {
  defaultQueryParams: Partial<TQueryParams>;
};

export const QueryParamsDefinition = {
  buildMappable<TQueryParams extends ParsedQuery>(
    queryParamsKeys: Array<keyof TQueryParams>,
    defaultQueryParams: Partial<TQueryParams>,
  ): MappableQueryParamsDefinition<TQueryParams> {
    return {
      queryParamsKeys,
      defaultQueryParams,
    };
  },

  build<TQueryParams extends ParsedQuery>(
    defaultQueryParams: Partial<TQueryParams>,
  ): QueryParamsDefinition<TQueryParams> {
    return {
      defaultQueryParams,
    };
  },

  toUrl<TQueryParams extends ParsedQuery>(
    queryParamsDefinition: QueryParamsDefinition<TQueryParams>,
    params: TQueryParams,
  ): string {
    const queryParamsWithDefaults = { ...params, ...queryParamsDefinition.defaultQueryParams };
    const queryParamsUrl: string = queryParamsImpl.stringify(queryParamsWithDefaults);
    const hasQueryParams = Object.keys(queryParamsWithDefaults).length > 0;
    return hasQueryParams ? `?${queryParamsUrl}` : '';
  },
};

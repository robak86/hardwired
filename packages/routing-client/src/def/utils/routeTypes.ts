import { ParsedQuery, PathDefinition, QueryParamsDefinition } from '@roro/routing-core';


// prettier-ignore
export type RouteParams<TPathParams, TQueryParams extends ParsedQuery> =
  PathParams<TPathParams> &
  QueryParams<TQueryParams>;

export type PathParams<TPathParams> = {
  pathParams: TPathParams;
};

export type QueryParams<TQueryParams extends ParsedQuery> = {
  queryParams: TQueryParams;
};

// prettier-ignore
export type InferAreParamsRequired<TTestSubject> =
    [TTestSubject] extends [never] ? 'notRequired':
    keyof TTestSubject extends [] ? 'notRequired':
    {} extends TTestSubject ? 'optional':
    'required';

// prettier-ignore
export type InferParamsObject<TKey extends string, TTestSubject> =
    InferAreParamsRequired<TTestSubject> extends 'required' ? {[K in TKey]: TTestSubject}:
    InferAreParamsRequired<TTestSubject> extends 'optional' ? {[K in TKey]?: TTestSubject}:
    InferAreParamsRequired<TTestSubject> extends 'notRequired' ? {} :
    never;

// prettier-ignore
export type RouteParamsArg<TPathParams, TQueryParams extends ParsedQuery> =
  InferParamsObject<'pathParams', TPathParams> &
  InferParamsObject<'queryParams', TQueryParams>;

// prettier-ignore
export type BuildUrlRouteParamsArg<TPathParams, TQueryParams extends ParsedQuery> =
  keyof RouteParamsArg<TPathParams, TQueryParams> extends [] ? [] : // there is no keys, even optionals
  {} extends RouteParamsArg<TPathParams, TQueryParams> ? [RouteParamsArg<TPathParams, TQueryParams>?] : // there are some params, but all are optional
  [RouteParamsArg<TPathParams, TQueryParams>] // required params are present

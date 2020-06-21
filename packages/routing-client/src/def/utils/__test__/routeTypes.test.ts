import { expectType, TypeEqual } from 'ts-expect';
import { InferAreParamsRequired, InferParamsObject, BuildUrlRouteParamsArg } from '../routeTypes';

describe('InferAreParamsRequired', () => {
  it('returns optional type for all optional params', () => {
    type ResultType = InferAreParamsRequired<{ a?: string }>;
    expectType<TypeEqual<ResultType, 'optional'>>(true);
  });

  it('returns required if object has at least one non optional property', () => {
    type ResultType = InferAreParamsRequired<{ a?: string; b: string }>;
    expectType<TypeEqual<ResultType, 'required'>>(true);
  });

  it('returns notRequired type if inner type is empty object', () => {
    type ResultType = InferAreParamsRequired<{}>;
    expectType<TypeEqual<ResultType, 'notRequired'>>(true);
  });

  it('returns notRequired type if inner type is never', () => {
    type ResultType = InferAreParamsRequired<never>;
    expectType<TypeEqual<ResultType, 'notRequired'>>(true);
  });
});

describe('InferParamsObject', () => {
  it('returns object with required key if params are not optional', () => {
    type ResultType = InferParamsObject<'queryParams', { a: string; b?: string }>;
    expectType<TypeEqual<ResultType, { queryParams: { a: string; b?: string } }>>(true);
  });

  it('returns object with optional key if all params keys are optional', () => {
    type ResultType = InferParamsObject<'queryParams', { a?: string; b?: string }>;
    expectType<TypeEqual<ResultType, { queryParams?: { a?: string; b?: string } }>>(true);
  });

  it('returns empty object if no params are required', () => {
    type ResultType = InferParamsObject<'queryParams', {}>;
    expectType<TypeEqual<ResultType, {}>>(true);
  });
});

describe('BuildUrlRouteParamsArg', () => {
  it('is required if query params contain some non optional keys', () => {
    type ResultType = BuildUrlRouteParamsArg<{ optional?: string }, { required: string }>;
    expectType<TypeEqual<ResultType, [{ queryParams: { required: string } }]>>(true);
  });

  it('is required if path params contain some non optional keys', () => {
    type ResultType = BuildUrlRouteParamsArg<{ required: string }, { required?: string }>;
    expectType<TypeEqual<ResultType, [{ pathParams: { required: string } }]>>(true);
  });

  it('is required if both query params and path params contain some non optional keys', () => {
    type ResultType = BuildUrlRouteParamsArg<{ required: string }, { required: string }>;
    expectType<TypeEqual<ResultType, [{ pathParams: { required: string }; queryParams: { required: string } }]>>(true);
  });

  it('is optional if all params are optional', () => {
    type ResultType = BuildUrlRouteParamsArg<{ optional?: string }, { optional?: string }>;
    expectType<TypeEqual<ResultType, [{ pathParams?: { optional?: string }; queryParams?: { optional?: string } }?]>>(
      true,
    );
  });
});

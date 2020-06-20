import { QueryRouteDefinition } from '@roro/routing-contract';
import { Handler } from '..';
import { HttpResponse } from '@roro/server';
import { RouteParams } from './commandRouteHandler';

export function queryRouteHandler<TRoutePayload extends object, TResponse extends object, TInput>(
  definition: QueryRouteDefinition<TRoutePayload, TResponse>,
  h: Handler<TInput & RouteParams<TRoutePayload>, any, HttpResponse<TResponse>>,
): Handler<TInput, any, TResponse | undefined> {
  throw new Error('implement me');
}

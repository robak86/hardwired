import { Handler } from '../handler/handler';
import { CommandRouteDefinition } from '@roro/routing-contract';
import { HttpResponse } from '@roro/server/lib';

export type RouteParams<T> = {
  params: T;
};

// prettier-ignore
// TODO: Use this for exhaustive checks!!!!!!
type IfEquals<T, U, Y=unknown, N=never> =
    T extends U ? U extends T ? T : N : N

export function commandRouteHandler<
  TRoutePayload extends object,
  TResponse extends object,
  // THandlerResponse extends TResponse,
  TInput
>(params: {
  definition: CommandRouteDefinition<TRoutePayload, TResponse>;
  handler: Handler<TInput & RouteParams<TRoutePayload>, any, HttpResponse<TResponse>>;
}): Handler<TInput, any, TResponse> {
  // CommandRouteDefinition.

  throw new Error('implement me');
}

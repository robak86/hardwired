import { ResponseEffect, ResponseInterpreter } from '../server/Response';
import { HTTPMethod } from 'find-my-way';
import { Router } from './Router';
import { AnyInstanceDefinition, asyncFactory, LifeTime, singleton } from 'hardwired';
import { RequestContext } from '../server/requestContext';

export type RouteHandlerDefinition =
  | AnyInstanceDefinition<ResponseEffect, LifeTime.request, never>
  | AnyInstanceDefinition<ResponseEffect, LifeTime.request, { reqCtx: RequestContext }>;

const responseInterpreter = singleton.class(ResponseInterpreter);
const routerD = singleton.class(Router, responseInterpreter);

export const defineRouter = (
  ...handlers: [method: HTTPMethod, path: string, responseFactory: RouteHandlerDefinition][]
) => {
  return singleton.define(locator => {
    const router = locator.get(routerD);

    const factories = handlers.map(
      ([method, path, responseDef]) =>
        [
          method,
          path,
          asyncFactory(responseDef as AnyInstanceDefinition<ResponseEffect, LifeTime.request, [RequestContext]>),
        ] as const,
    );

    throw new Error("Implement me!")
    //
    // factories.forEach(([method, path, responseDef]) => {
    //   router.append(method, path, locator.get(responseDef));
    // });
    //
    // return router;
  });
};

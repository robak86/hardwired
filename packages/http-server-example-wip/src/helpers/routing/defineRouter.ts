import { ResponseEffect, ResponseInterpreter } from '../server/Response.js';
import { HTTPMethod } from 'find-my-way';
import { Router } from './Router.js';
import { AnyInstanceDefinition, asyncFactory, LifeTime, singleton } from 'hardwired';

const responseInterpreter = singleton.class(ResponseInterpreter);
const routerD = singleton.class(Router, responseInterpreter);

export const defineRouter = (
  ...handlers: [
    method: HTTPMethod,
    path: string,
    responseFactory: AnyInstanceDefinition<ResponseEffect, LifeTime.request>,
  ][]
) => {
  return singleton.define(locator => {
    const router = locator.get(routerD);

    const factories = handlers.map(
      ([method, path, responseDef]) =>
        [method, path, asyncFactory(responseDef as AnyInstanceDefinition<ResponseEffect, LifeTime.request>)] as const,
    );

    throw new Error('Implement me!');
  });
};

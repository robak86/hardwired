import { HttpRequest } from './Middleware';
import { HttpMethod } from '@roro/routing-contract';
import { ServerResponse } from 'http';

export type IApplicationRoute = {
  httpMethod: HttpMethod;
  pathDefinition: string;
  handler: (request: HttpRequest) => any;
};

export interface IApplication {
  addRoute(method: HttpMethod, path: string, handler: (request: HttpRequest) => any);
  replaceRoutes(routes: IApplicationRoute[]);
  run(httpRequest: HttpRequest, response: ServerResponse);
}

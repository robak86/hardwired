import { HttpMethod, HttpRequest, IMiddleware } from './Middleware';

export type IApplicationRoute = {
  httpMethod: HttpMethod;
  pathDefinition: string;
  handler: (request: HttpRequest) => any;
};

export interface IApplication extends IMiddleware<any> {
  addRoute(method: HttpMethod, path: string, handler: (request: HttpRequest) => any);
  replaceRoutes(routes: IApplicationRoute[]);
}

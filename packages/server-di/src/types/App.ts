import { HttpMethod, HttpRequest, IMiddleware } from './Middleware';

export interface IApplication extends IMiddleware<any> {
  addRoute(method: HttpMethod, path: string, handler: (request: HttpRequest) => any);
}

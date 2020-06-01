import { IMiddleware } from './Middleware';

export interface IApplication extends IMiddleware<any> {
  addRoute(method, path: string, handler: any);
}

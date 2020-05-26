import { IHandler, IMiddleware } from './Middleware';

export interface IApplication extends IMiddleware<any, any, any> {
  addRoute(method, path: string, handler: IHandler<any, any>);
}

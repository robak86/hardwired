import { IHandler } from './Middleware';

export interface IApplication {
  addRoute(method, path: string, handler: IHandler<any, any>);
}

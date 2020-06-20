import { IApplication, HttpMethod } from '@roro/s-middleware';
import { HttpRequest } from '../../s-middleware/src/Middleware';
import { IApplicationRoute } from '../../s-middleware/src/App';
import { ServerResponse } from 'http';

export class Application implements IApplication {
  addRoute(method: HttpMethod, path: string, handler: (request: HttpRequest) => any) {}
  replaceRoutes(routes: IApplicationRoute[]) {}
  run(httpRequest: HttpRequest, response: ServerResponse) {}
}

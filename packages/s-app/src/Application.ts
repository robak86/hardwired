import { IApplication, HttpMethod, RouteDefinition } from '@roro/s-middleware';
import { HttpRequest, HttpResponse } from '../../s-middleware/src/Middleware';
import { IApplicationRoute } from '../../s-middleware/src/App';
import { ServerResponse } from 'http';

export class Application implements IApplication {
  addRoute<TResponseData extends object>(
    routeDefinition: RouteDefinition<any, TResponseData>,
    handler: (request: HttpRequest) => Promise<HttpResponse<TResponseData>> | HttpResponse<TResponseData>,
  ) {}
  replaceRoutes(routes: IApplicationRoute<any, any>[]) {}
  run(httpRequest: HttpRequest, response: ServerResponse) {}
}

import { ContractRouteDefinition, IApplication } from '@roro/s-middleware';
import { HttpRequest, HttpResponse } from '../../s-middleware/src/Middleware';
import { IApplicationRoute } from '../../s-middleware/src/App';
import { ServerResponse } from 'http';
import { PathDefinition } from '@roro/routing-core';
import { HttpMethod } from '../../routing-contract/src/HttpMethod';

// TODO Application is basically an router :/
export class Application implements IApplication {
  private routes: IApplicationRoute<any, any>[] = [];

  addRoute<TResponseData extends object>(
    routeDefinition: ContractRouteDefinition<any, TResponseData>,
    handler: (request: HttpRequest) => Promise<HttpResponse<TResponseData>> | HttpResponse<TResponseData>,
  ) {}
  replaceRoutes(routes: IApplicationRoute<any, any>[]) {
    this.routes = [...routes];
  }
  run(httpRequest: HttpRequest, response: ServerResponse) {}

  hasRoute(method: HttpMethod, url: string): boolean {
    return this.routes.some(route => PathDefinition.match(url, route.routeDefinition));
  }
}

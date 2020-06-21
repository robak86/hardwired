import { HttpRequest, HttpResponse } from './Middleware';
import { IApplication, IApplicationRoute } from './App';
import { IncomingMessage, ServerResponse } from 'http';
import { PathDefinition } from '@roro/routing-core';
import { ContractRouteDefinition } from '@roro/routing-contract';

export class Router implements IApplication {
  private routes: IApplicationRoute<any, any>[] = [];

  addRoute<TResponseData extends object>(
    routeDefinition: ContractRouteDefinition<any, TResponseData>,
    handler: (request: HttpRequest) => Promise<HttpResponse<TResponseData>> | HttpResponse<TResponseData>,
  ) {}

  replaceRoutes(routes: IApplicationRoute<any, any>[]) {
    this.routes = [...routes];
  }

  run(httpRequest: IncomingMessage, response: ServerResponse) {}

  hasRoute(method: string | undefined, url: string | undefined): boolean {
    if (method === undefined || url === undefined) {
      return false;
    }

    return this.routes.some(route => PathDefinition.match(url, route.routeDefinition));
  }
}

import { ContractRouteDefinition, IApplication } from '@roro/s-middleware';
import { IApplicationRoute } from '../../s-middleware/src/App';
import { IncomingMessage, ServerResponse } from 'http';
import { PathDefinition } from '@roro/routing-core';
import { HttpRequest, HttpResponse } from "../../s-middleware/src/response";

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
  run(httpRequest: IncomingMessage, response: ServerResponse) {}

  hasRoute(method: string | undefined, url: string | undefined): boolean {
    if (method === undefined || url === undefined) {
      return false;
    }

    return this.routes.some(route => PathDefinition.match(url, route.routeDefinition));
  }
}

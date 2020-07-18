import { IRouter } from '@roro/s-middleware';
import { IApplicationRoute } from '../../s-middleware/src/App';
import { IncomingMessage, ServerResponse } from 'http';
import { PathDefinition } from '@roro/routing-core';

// TODO Application is basically an router :/
export class Application implements IRouter {
  private routes: IApplicationRoute<any, any>[] = [];

  addRoute<TResponseData extends object>(route: IApplicationRoute<any, any>) {}
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

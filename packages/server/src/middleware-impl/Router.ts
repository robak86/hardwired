import { IncomingMessage, ServerResponse } from 'http';
import { PathDefinition } from '@roro/routing-core';
import { HttpRequest, HttpResponse, IApplicationRoute, IRouter } from '@roro/s-middleware';

export class Router implements IRouter {
  private routes: IApplicationRoute<any, any>[] = [];

  addRoute<TResponseData extends object>(route: IApplicationRoute<any, TResponseData>) {}

  replaceRoutes(routes: IApplicationRoute<any, any>[]) {
    this.routes = [...routes];
  }

  // TODO: Ideally run should have the same interface as IHandler in order to make it easily composeable
  run = async (httpRequest: IncomingMessage, response: ServerResponse) => {
    const { url, method } = httpRequest;

    if (method === undefined || url === undefined) {
      throw new Error('missing handler');
    }

    const handler: IApplicationRoute<any, any> | undefined = this.routes.find(route => {
      console.log('matching', url, method, route.routeDefinition);
      return PathDefinition.match(url, route.routeDefinition);
    });

    if (handler) {
      const handlerResponse: HttpResponse<any> = await handler.handler(HttpRequest.build(httpRequest));

      response.writeHead(200, { 'Content-type': 'application/json' });
      response.end(JSON.stringify(handlerResponse.data));
    } else {
      response.writeHead(404, { 'Content-type': 'text/plain' });
      response.end('Not Found\n');
    }
  };
}

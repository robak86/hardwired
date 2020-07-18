import { IApplication, IApplicationRoute } from './App';
import { IncomingMessage, ServerResponse } from 'http';
import { PathDefinition } from '@roro/routing-core';
import { ContractRouteDefinition } from '@roro/routing-contract';
import { HttpRequest, HttpResponse } from './response';

export class Router implements IApplication {
  private routes: IApplicationRoute<any, any>[] = [];

  addRoute<TResponseData extends object>(
    routeDefinition: ContractRouteDefinition<any, TResponseData>,
    handler: (request: HttpRequest) => Promise<HttpResponse<TResponseData>> | HttpResponse<TResponseData>,
  ) {}

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

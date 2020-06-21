import { HttpRequest, HttpResponse } from './Middleware';
import { ContractRouteDefinition } from '@roro/routing-contract';
import { IncomingMessage, ServerResponse } from 'http';

export type IApplicationRoute<TRequestParams extends object, TResponseData extends object> = {
  routeDefinition: ContractRouteDefinition<TRequestParams, TResponseData>;
  handler: (request: HttpRequest) => Promise<HttpResponse<TResponseData>> | HttpResponse<TResponseData>;
};

export interface IApplication {
  addRoute<TResponseData extends object>(
    routeDefinition: ContractRouteDefinition<any, TResponseData>,
    handler: (request: HttpRequest) => Promise<HttpResponse<TResponseData>> | HttpResponse<TResponseData>,
  );
  replaceRoutes(routes: IApplicationRoute<any, any>[]);
  run(httpRequest: IncomingMessage, response: ServerResponse);
  hasRoute(method: string | undefined, url: string | undefined): boolean;
}

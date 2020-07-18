import { ContractRouteDefinition } from '@roro/routing-contract';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpRequest, HttpResponse } from './response';

export type IApplicationRoute<TRequestParams extends object, TResponseData extends object> = {
  routeDefinition: ContractRouteDefinition<TRequestParams, TResponseData>;
  handler: (request: HttpRequest) => Promise<HttpResponse<TResponseData>> | HttpResponse<TResponseData>;
};

export interface IRouter {
  addRoute<TResponseData extends object>(route: IApplicationRoute<any, TResponseData>);
  replaceRoutes(routes: IApplicationRoute<any, any>[]);
  run(httpRequest: IncomingMessage, response: ServerResponse);
}

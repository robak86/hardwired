import createRouter, { HTTPMethod } from 'find-my-way';
import { IAsyncFactory } from 'hardwired';
import { ResponseEffect, ResponseInterpreter } from '../server/Response.js';
import { RequestContext } from '../server/requestContext.js';
import { IncomingMessage, ServerResponse } from 'http';

export class Router {
  private router = createRouter();

  constructor(private responseInterpreter: ResponseInterpreter) {}

  append(method: HTTPMethod, path: string, handler: IAsyncFactory<ResponseEffect, [RequestContext]>) {
    this.router.on(method, path, async (req, res, routeParams) => {
      const response = await handler.build({ req, res, routeParams });
      this.responseInterpreter.onResponse(response, res);
    });
  }

  lookup(req: IncomingMessage, res: ServerResponse) {
    this.router.lookup(req, res);
  }
}

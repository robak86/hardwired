import createRouter, { HTTPMethod } from 'find-my-way';
import { IncomingMessage, ServerResponse } from 'http';
import { IAsyncFactory } from 'hardwired';
import { ResponseEffect, ResponseInterpreter } from '../server/Response';
import { RequestContext } from '../server/requestContext';



export class Router {
    private router = createRouter();

    constructor(private responseInterpreter: ResponseInterpreter) {
    }

    append(
        method: HTTPMethod,
        path: string,
        handler: IAsyncFactory<ResponseEffect, { reqCtx: RequestContext }>,
    ) {
        this.router.on(method, path, async (req, res, routeParams) => {
            const response = await handler.build({reqCtx: {req, res, routeParams}});
            this.responseInterpreter.onResponse(response, res);
        });
    }

    lookup(req: IncomingMessage, res: ServerResponse) {
        this.router.lookup(req, res);
    }
}

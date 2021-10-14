import http, { IncomingMessage, ServerResponse } from 'http';
import createRouter, { HTTPMethod } from 'find-my-way';
import { asyncFactory, external, factory, IAsyncFactory, intersection, object, request, singleton, tuple } from 'hardwired';

const requestD = external<{ req: IncomingMessage }>();
const responseD = external<{ res: ServerResponse }>();

const requestExternals = intersection(requestD, responseD)

type RequestExternals = {
  req: IncomingMessage;
  res: ServerResponse;
};



type Handler<TContext> = (ctx: TContext) => Promise<void>;

const handler: Handler<RequestExternals> = async () => {};

type HandlerFactory<TExternals> = IAsyncFactory<() => Promise<void>, TExternals>;

const handler1D = asyncFactory(request.asyncPartial(handler, requestExternals));
const handler2D = asyncFactory(request.asyncPartial(handler, requestExternals));

const appHandlers = object({
  root: handler1D,
  health: handler2D,
});

type RouterHandlers<TContext = RequestExternals> = {
  root: IAsyncFactory<Handler<TContext>, TContext>;
  health: IAsyncFactory<Handler<TContext>, TContext>;
};

const buildRouter = (handlers: RouterHandlers) => {
  const router = new Router();

  // router.append('GET', '/', handlers.root);
  // router.append('GET', '/health', handlers.health);
};

const appHandlers2 = tuple(handler1D, handler2D);
const routerD = singleton.partial(buildRouter, appHandlers);

class Router {
  private router = createRouter();

  constructor() {}

  append(method: HTTPMethod, path: string, handler: HandlerFactory<RequestExternals>) {
    this.router.on(method, path, async (req, res) => {
      const handlerInstance = await handler.build({ req, res });
      await handlerInstance();
    });
  }

  lookup(req: IncomingMessage, res: ServerResponse) {
    this.router.lookup(req, res);
  }
}

// const routerD = request.class(Router, appHandlers2);

const requestListener = function (req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200);
  res.end('Hello, World!');
};

const router = createRouter();

router.on('GET', '/', (req, res, params) => {
  res.end('{"message":"hello world"}');
});

const server = http.createServer(requestListener);
server.listen(8080);

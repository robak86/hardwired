import http, { IncomingMessage, ServerResponse } from 'http';
import createRouter, { HTTPMethod } from 'find-my-way';
import { asyncFactory, external, IAsyncFactory, object, request, singleton, transient, tuple, value } from 'hardwired';

export const requestD = external<IncomingMessage>();
export const responseD = external<ServerResponse>();
export const nextD = external<() => Promise<void>>();

const extraD = value({ db: '123' });

const handler = async (req: IncomingMessage, res: ServerResponse) => {};
const handler2 = async (req: IncomingMessage, res: ServerResponse, extras) => {};
const handler3 = async (extras: { db: string }) => (req: IncomingMessage, res: ServerResponse) => {};
const handler4 = async (req: IncomingMessage, res: ServerResponse) => (extras: { db: string }) => {};

type HandlerFactory = IAsyncFactory<() => Promise<void>, [IncomingMessage, ServerResponse]>;

const handler1D = asyncFactory(request.asyncPartial(handler, requestD, responseD));
const handler2D = asyncFactory(request.asyncPartial(handler2, requestD, responseD, extraD));
const handler3D = asyncFactory(request.asyncPartial(handler3, extraD, requestD, responseD));
const handler4D = asyncFactory(request.asyncPartial(handler4, requestD, responseD, extraD));

const appHandlers = object({
  root: handler1D,
  health: handler2D,
});

type RouterHandlers = {
  root: HandlerFactory;
  health: HandlerFactory;
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

  append(method: HTTPMethod, path: string, handler: HandlerFactory) {
    this.router.on(method, path, async (req, res) => {
      const handlerInstance = await handler.build(req, res);
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

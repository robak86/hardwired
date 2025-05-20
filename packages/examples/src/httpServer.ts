import { createServer, type IncomingMessage } from 'node:http';
import type { Server } from 'http';

import { container, scoped, singleton } from 'hardwired';

const reqD = scoped<IncomingMessage>();
const requestHandlerD = scoped<IRequestHandler>();
const serverD = singleton<Server>();

interface IRequestHandler {
  handle(req: IncomingMessage): object;
}

class HomePageHandler implements IRequestHandler {
  // static instance = cls.scoped(this, [reqD]);

  constructor(private _req: IncomingMessage) {}

  handle() {
    return {
      hello: 'world',
      path: this._req.url,
      headers: this._req.headers,
    };
  }

  [Symbol.dispose]() {
    console.log('Disposing handler instance');
  }
}

const cnt = container.new(c => {
  c.add(serverD).locator(serviceLocator => {
    return createServer((req, res) => {
      const requestScope = serviceLocator.scope(scope => {
        scope.add(reqD).static(req);
        scope.add(requestHandlerD).class(HomePageHandler, reqD);
      });

      requestScope
        .useAsync(requestHandlerD)
        .then(handler => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(handler.handle(req)));
        })
        .catch(_err => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'something went wrong' }));
        })
        .finally(() => {
          requestScope.dispose();
        });
    });
  });
});

const server = await cnt.use(serverD);

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

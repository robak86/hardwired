import { createServer, type IncomingMessage } from 'node:http';

import { cls, fn, once, unbound } from 'hardwired';

const reqD = unbound.scoped<IncomingMessage>();

interface IRequestHandler {
  handle(req: IncomingMessage): object;
}

class HomePageHandler implements IRequestHandler {
  static instance = cls.scoped(this, [reqD]);

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

const app = fn.singleton(use => {
  return createServer((req, res) => {
    const requestScope = use.scope(reqScope => {
      reqScope.overrideCascading(reqD).toValue(req);
    });

    const handler = requestScope.use(HomePageHandler.instance);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(handler.handle()));

    requestScope.dispose();
  });
});

once(app).listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

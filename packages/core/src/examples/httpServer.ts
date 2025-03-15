import { createServer, type IncomingMessage } from 'node:http';

import { unbound } from '../definitions/unbound.js';
import { cls } from '../definitions/cls.js';
import { fn } from '../definitions/fn.js';
import { once } from '../container/Container.js';

const reqD = unbound<IncomingMessage>();

interface IRequestHandler {
  handle(req: IncomingMessage): string;
}

class HomePageHandler implements IRequestHandler {
  static instance = cls.scoped(this, [reqD]);

  constructor(private _req: IncomingMessage) {}

  handle(): string {
    console.log(this._req.url);

    return 'Hello, World!';
  }

  [Symbol.dispose]() {
    console.log('Disposing handler instance');
  }
}

const app = fn.singleton(use => {
  return createServer((req, res) => {
    const requestScope = use.scope(s => {
      s.bindCascading(reqD).toValue(req);
    });

    const handler = requestScope.use(HomePageHandler.instance);

    res.end(handler.handle());
  });
});

once(app).listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

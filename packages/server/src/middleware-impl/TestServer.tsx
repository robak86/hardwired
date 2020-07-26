import { IServer } from '@roro/s-middleware';
import http, { IncomingMessage, ServerResponse } from 'http';
import { Server } from './ServerHttp1';
import { ConsoleLogger } from './ConsoleLogger';

export class TestServer implements IServer {
  private server: Server = new Server({ port: undefined }, new ConsoleLogger());

  replaceListener(listener: (request: IncomingMessage, response: ServerResponse) => void) {
    this.server.replaceListener(listener);
  }

  listen(): http.Server {
    return this.server.listen();
  }
}

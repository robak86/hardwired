import { ILogger, IServer } from '@roro/s-middleware';
import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';

export type ServerConfig = {
  port?: number;
};

export class Server implements IServer {
  private requestListener = (request: IncomingMessage, response: ServerResponse) => {
    response.writeHead(200, { 'Content-type': 'text/plain' });
    response.end('Hello world\n');
  };

  constructor(private config: ServerConfig, private logger: ILogger) {}

  replaceListener(listener: (request: IncomingMessage, response: ServerResponse) => void) {
    this.requestListener = listener;
  }

  listen(): http.Server {
    return http.createServer(this.requestListener).listen(this.config.port, () => {
      this.logger.info(`Server listening on port ${this.config.port}`);
    });
  }
}

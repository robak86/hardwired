import http, { RequestListener } from 'http';
import { AddressInfo } from 'net';
import { withContainer, withRequest } from './withContainer.js';
import { request } from 'hardwired';
import { useDefinition } from './useDefinition.js';

export type ServerInstance = {
  port: number;
  close: () => Promise<void>;
};

export const startServer = (server: http.Server, port: number): ServerInstance => {
  const instance = server.listen(port);

  server.keepAliveTimeout = 60 * 1000 + 1000;
  server.headersTimeout = 60 * 1000 + 2000;

  return {
    get port(): number {
      const serverInstanceAddress = instance.address();
      const port = (serverInstanceAddress as AddressInfo)?.port;
      if (!port) {
        throw new Error(`Cannot get server port number`);
      }
      return port;
    },
    close: () => {
      return new Promise<void>((resolve, reject) => {
        server.on('close', resolve);
        server.close(reject);
      });
    },
  };
};

const idDef = request.fn(() => Math.random());

export const createServer = (): ServerInstance => {
  return withContainer(() => {
    const requestListener: RequestListener = (req, res) => {
      withRequest(() => {
        const val = useDefinition(idDef);
        console.log('val', val);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `It's fine ${val}` }));
      });
    };

    const server = http.createServer(requestListener);

    return startServer(server, 5001);
  });
};

createServer();

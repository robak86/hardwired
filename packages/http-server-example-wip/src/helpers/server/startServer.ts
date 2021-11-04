import http from 'http';
import { AddressInfo } from 'net';
import invariant from 'tiny-invariant';

export type ServerInstance = {
  port: number;
  close: () => Promise<void>;
};

export const startServer = (server: http.Server, port: number): ServerInstance => {
  const instance = server.listen(port);

  return {
    get port(): number {
      const serverInstanceAddress = instance.address();
      const port = (serverInstanceAddress as AddressInfo)?.port;
      invariant(!!port, `Cannot get server port number`);
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

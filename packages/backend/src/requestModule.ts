import { unit } from 'hardwired';

import findMyWay from 'find-my-way';
import { IncomingMessage } from 'http';

const router = findMyWay();

router.on('GET', '/', (req, res, params) => {
  res.end('{"message":"hello world"}');
});

const emptyIncomingMessage = (): IncomingMessage => {
  return {} as any;
};

const defaultServerConfig = () => {
  return {
    port: 3000,
  };
};

export const requestHttp1Module = unit()
  .define('request', emptyIncomingMessage)
  .define('serverConfig', defaultServerConfig)
  .build();

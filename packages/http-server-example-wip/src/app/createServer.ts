import http, { RequestListener } from 'http';
import { Router } from '../helpers/routing/Router.js';
import { EnvConfig, EnvConfigKey } from '../config/EnvConfig.js';
import { Logger } from 'winston';
import { ServerInstance, startServer } from '../helpers/server/startServer.js';

export const createServer = (appRouter: Router, envConfig: EnvConfig, logger: Logger): ServerInstance => {
  const requestListener: RequestListener = (req, res) => {
    appRouter.lookup(req, res);
  };

  const server = http.createServer(requestListener);
  const port = envConfig[EnvConfigKey.SERVER_PORT];

  logger.info(port ? `Starting server at port: ${port}` : `Starting server at random port`);

  return startServer(server, port);
};

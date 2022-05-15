import { singleton } from 'hardwired';
import { createServer } from './app/createServer.js';
import { envConfigD } from './config/config.di.js';
import { buildServerFetch } from './server/createAppClient.js';
import { loggerD } from './logger/createLogger.js';
import { appRouterD } from './app/appRouter.js';

export const appServerD = singleton.fn(createServer, appRouterD, envConfigD, loggerD);
export const appClientD = singleton.fn(buildServerFetch, appServerD);

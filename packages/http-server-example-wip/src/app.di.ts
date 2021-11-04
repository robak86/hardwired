import { singleton } from 'hardwired';
import { createServer } from './app/createServer';
import { envConfigD } from './config/config.di';
import { buildServerFetch } from './server/createAppClient';
import { loggerD } from './logger/createLogger';
import { appRouterD } from './app/appRouter';

export const appServerD = singleton.fn(createServer, appRouterD, envConfigD, loggerD);
export const appClientD = singleton.fn(buildServerFetch, appServerD);

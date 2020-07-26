import 'source-map-support/register';
import { commonDefines, unit } from '@hardwired/di';
import { domainModule } from './domain1/module';
import { serverDefinitions, testModule } from '@hardwired/server';
import { Server, Router } from '@roro/server';
import { Logger } from './shared/Logger';
import { ServerConfig } from '../../server/src/middleware-impl/ServerHttp1';
import axios from 'axios';

export const appModule = unit('app')
  .using(commonDefines)
  .import('domainModule', domainModule)
  .value('config', { port: 4000 } as ServerConfig)
  .singleton('logger', Logger)
  .using(serverDefinitions)
  .server('server', Server, ctx => [ctx.config, ctx.logger])
  .router('router', Router);

export const appTestModule = testModule(appModule, ({ port, address }) => {
  console.log(port, address);
  return axios.create({
    baseURL: `http://localhost:${port}/`,
  });
});

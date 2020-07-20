import { commonDefines, unit } from '@hardwired/di';
import { domainModule } from './domain1/module';
import { serverDefinitions } from '@hardwired/server';
import { Server } from '@roro/server';

import 'source-map-support/register';
import { Logger } from './shared/Logger';

export const appModule = unit('app')
  .using(commonDefines)
  .import('domainModule', domainModule)
  .value('config', { port: 4000 })
  .singleton('logger', Logger)
  .using(serverDefinitions)
  .server('server', Server, ctx => [ctx.config, ctx.logger]);

export const appTestModule = appModule.replace('server', )



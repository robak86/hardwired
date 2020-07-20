import { serverDefinitions } from '@hardwired/server';
import { unit } from '@hardwired/di';
import { helloWorldRoute } from './contracts/helloWorldRoute1';
import { HelloWorldHandler, paramsParser } from './handlers/HelloWorldHandler';

export const domainModule = unit('server')
  .using(serverDefinitions)
  .task('helloWorldParams', paramsParser(helloWorldRoute))
  .handler('helloWorldHandler', helloWorldRoute, HelloWorldHandler, ctx => [ctx.helloWorldParams]);


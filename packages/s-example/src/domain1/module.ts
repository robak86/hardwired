import { serverDefinitions } from '@hardwired/server';
import { unit, commonDefines } from '@hardwired/di';
import { helloWorldRoute } from './contracts/helloWorldRoute1';
import { HelloWorldHandler, paramsParser } from './handlers/HelloWorldHandler';
import { middlewaresModule } from './middlewares/middlewaresModule';

export const domainModule = unit('server') //breakme
  .using(commonDefines)
  .import('middlewares', middlewaresModule)

  .using(serverDefinitions)
  .task('helloWorldParams', paramsParser(helloWorldRoute))

  .withMiddleware(
    container => [container.middlewares.cors],
    define => define.handler('helloWorldHandler', helloWorldRoute, HelloWorldHandler, ctx => [ctx.helloWorldParams]),
  );

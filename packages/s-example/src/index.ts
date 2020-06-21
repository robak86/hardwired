import { container, unit, commonDefines } from '@hardwired/di';
import { serverDefinitions } from '@hardwired/server';
import { createQueryRoute } from '@roro/routing-contract';
import { IHandler, HttpMethod, response, ILogger } from '@roro/s-middleware';
import { Server } from '@roro/server';

const helloWorldRoute = createQueryRoute<{}, HelloWorldResponse>(HttpMethod.GET, '/hello').mapParams([], []);

type HelloWorldResponse = { message: string };

class HelloWorldHandler implements IHandler<HelloWorldResponse> {
  run() {
    return response({ message: 'Hello world' });
  }
}

class Logger implements ILogger {
  info(message) {
    console.log(message);
  }
}

export const demoApp = unit('app')
  .using(commonDefines)
  .value('config', { port: 4000 })
  .singleton('logger', Logger)
  .using(serverDefinitions)
  .server('server', Server, ctx => [ctx.config, ctx.logger])
  .handler('demo', helloWorldRoute, HelloWorldHandler);

const c = container(demoApp);

c.get('server').listen();

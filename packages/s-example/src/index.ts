import 'source-map-support/register';
import { container, unit } from '@hardwired/di-core';
import { commonDefines } from '@hardwired/di';
import { serverDefinitions } from '@hardwired/server';
import { createQueryRoute } from '@roro/routing-contract';
import { HttpMethod, IHandler, ILogger, response } from '@roro/s-middleware';
import { Server } from '@roro/server';
import { ContractRouteDefinition } from '../../routing-contract/src/ContractRouteDefinition';

type HelloWorldParams = { a: 'string' };

const helloWorldRoute = createQueryRoute<HelloWorldParams, HelloWorldResponse>(HttpMethod.GET, '/hello').mapParams(
  ['a'],
  [],
);

const helloWorldRoute2 = createQueryRoute<HelloWorldParams, HelloWorldResponse>(HttpMethod.GET, '/hello2').mapParams(
  ['a'],
  [],
);

function paramsParser<TParams extends {}>(contractRouteDefinition: ContractRouteDefinition<TParams, any>) {
  return class {
    run() {
      return 'dummy value' as any;
    }
  };
}

type HelloWorldResponse = { message: string };

class HelloWorldHandler implements IHandler<HelloWorldResponse> {
  constructor(private params: HelloWorldParams) {}

  run() {
    return response({ message: 'Hello world', parsedParams: this.params });
  }
}

class Logger implements ILogger {
  info(message) {
    console.log(message);
  }
}

// TODO: maybe .using(serverDefinitions) should create implicitly and router ?
// TODO: maybe .using(serverDefinitions) should create implicitly and errorHandler ?
// TODO: having onChildDefinition, onOwnDefinition events would be helpful for precisely registering the handlers ?

// TODO: implement builder.middleware and builder.

export const domainModule = unit('server')
  .using(serverDefinitions)
  .task('helloWorldParams', paramsParser(helloWorldRoute))
  .handler('helloWorldHandler', helloWorldRoute, HelloWorldHandler, ctx => [ctx.helloWorldParams])
  .handler('helloWorldHandler2', helloWorldRoute2, HelloWorldHandler, ctx => [ctx.helloWorldParams]);

export const demoApp = unit('app')
  .using(commonDefines)
  .value('config', { port: 4000 })
  .singleton('logger', Logger)
  .using(serverDefinitions)
  .server('server', Server, ctx => [ctx.config, ctx.logger])
  .using(commonDefines)
  .import('domainModule', domainModule);

const c = container(demoApp);

c.get('server').listen();

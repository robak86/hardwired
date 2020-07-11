import { serverUnit } from '../testing/helpers';
import { IHandler, IServer, response, Task } from '@roro/s-middleware';

import { IncomingMessage, ServerResponse } from 'http';
import { serverDefinitions } from '../builders/ServerModuleBuilder';
import { commonDefines, unit, container } from '@hardwired/di';
import { ContractRouteDefinition, HttpMethod } from '@roro/routing-contract';

describe(`handlers`, () => {
  class DummyTask implements Task<number> {
    run = jest.fn().mockReturnValue(1);
  }

  class DummyHandler implements IHandler<{ a: number }> {
    constructor(private taskValue: number) {}
    run = jest.fn().mockImplementation(() => this.taskValue);
  }

  const routeDefinition: ContractRouteDefinition<any, any> = {
    httpMethod: HttpMethod.GET,
    pathDefinition: '/hello',
    type: 'query',
  };

  class Server implements IServer {
    public onRequest = (request: IncomingMessage, response: ServerResponse) => {};

    constructor() {}

    replaceListener(listener: (request: IncomingMessage, response: ServerResponse) => void) {
      this.onRequest = listener;
    }

    listen() {
      throw new Error('Not implemented');
    }
  }

  describe(`importing handlers from child module`, () => {
    const domainModule = serverUnit('domain')
      .task('helloWorldParams', DummyTask)
      .handler('helloWorldHandler', routeDefinition, DummyHandler, ctx => [ctx.helloWorldParams]);

    const demoApp = unit('app')
      .using(serverDefinitions)
      .server('server', Server)
      .using(commonDefines)
      .import('domainModule', domainModule);

    it(`works with task`, async () => {
      const server = container(demoApp).get('server');

      server.onRequest({ url: '/hello', method: 'post' } as any, {} as any);

    });
  });
});
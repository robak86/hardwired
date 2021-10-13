import { value } from '../value';
import { external } from '../external';
import { factory, IFactory } from '../factory';
import { request, transient } from '../../definitions';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/InstanceDefinition';
import { container } from '../../../container/Container';
import { v4 } from 'uuid';
import { set } from '../../../patching/set';

describe(`factory`, () => {
  type Request = { requestObj: 'req' };

  class Handler {
    constructor(public request: Request, public logger: Logger, public requestId: string) {}
  }

  class Logger {
    constructor(public request: Request, public requestId: string) {}
  }

  class Router {
    constructor(public handlersFactory: IFactory<Handler, Request>) {}
  }

  const requestD = external<Request>();

  describe(`building definition`, () => {
    it(`cancels moves externals to IFactory params producing InstanceDefinition having void for TExternals`, async () => {
      const requestIdD = value('1');
      const loggerD = transient.class(Logger, requestD, requestIdD);
      const handlerD = transient.class(Handler, requestD, loggerD, requestIdD);
      const routerD = transient.class(Router, factory(handlerD));

      const factoryD = factory(handlerD);
      expectType<TypeEqual<typeof factoryD, InstanceDefinition<IFactory<Handler, Request>, void>>>(true);
    });
  });

  describe(`using factory`, () => {
    it(`injects working instance of factory`, async () => {
      const requestIdD = value('1');
      const loggerD = transient.class(Logger, requestD, requestIdD);
      const handlerD = transient.class(Handler, requestD, loggerD, requestIdD);
      const routerD = transient.class(Router, factory(handlerD));

      const cnt = container();
      const result = cnt.get(routerD);
      const externalsValue: Request = { requestObj: 'req' };

      expect(result.handlersFactory.build(externalsValue)).toBeInstanceOf(Handler);
      expect(result.handlersFactory.build(externalsValue).request).toEqual(externalsValue);
      expect(result.handlersFactory.build(externalsValue).requestId).toEqual('1');
    });

    describe('request lifetime support', () => {
      it(`creates new request scope for each IFactory .build call, ex. 1`, async () => {
        const requestIdD = request.fn(() => v4());
        const loggerD = transient.class(Logger, requestD, requestIdD);
        const handlerD = transient.class(Handler, requestD, loggerD, requestIdD);
        const routerD = transient.class(Router, factory(handlerD));

        const cnt = container();
        const result = cnt.get(routerD);
        const externalsValue: Request = { requestObj: 'req' };

        const handler = result.handlersFactory.build(externalsValue);

        expect(handler).toBeInstanceOf(Handler);
        expect(handler.requestId).toEqual(handler.logger.requestId);
      });

      it(`creates new request scope for each IFactory .build call, ex. 2`, async () => {
        const requestIdD = request.fn(() => v4());
        const loggerD = transient.class(Logger, requestD, requestIdD);
        const handlerD = request.class(Handler, requestD, loggerD, requestIdD);
        const routerD = request.class(Router, factory(handlerD));

        const cnt = container();
        const result = cnt.get(routerD);
        const externalsValue: Request = { requestObj: 'req' };

        const handlerInstance1 = result.handlersFactory.build(externalsValue);
        const handlerInstance2 = result.handlersFactory.build(externalsValue);

        expect(handlerInstance1.requestId).not.toEqual(handlerInstance2.requestId);
      });

      it(`supports global override`, async () => {
        const requestIdD = request.fn(() => v4());
        const loggerD = transient.class(Logger, requestD, requestIdD);
        const handlerD = transient.class(Handler, requestD, loggerD, requestIdD);
        const routerD = transient.class(Router, factory(handlerD));

        const cnt = container([set(requestIdD, 'overridden')]);
        const result = cnt.get(routerD);
        const externalsValue: Request = { requestObj: 'req' };
        const handler = result.handlersFactory.build(externalsValue);

        expect(handler).toBeInstanceOf(Handler);
        expect(handler.requestId).toEqual('overridden');
      });
    });
  });
});

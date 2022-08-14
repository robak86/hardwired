import { value } from '../value.js';
import { implicit } from '../implicit.js';
import { factory, IFactory } from '../factory.js';
import { request, singleton, transient } from '../../definitions.js';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/sync/InstanceDefinition.js';
import { container } from '../../../container/Container.js';
import { v4 } from 'uuid';
import { set } from '../../../patching/set.js';
import { LifeTime } from '../../abstract/LifeTime.js';

import { describe, expect, it, vi } from 'vitest';

describe(`factory`, () => {
  describe(`factory without params`, () => {
    it(`creates correct factory`, async () => {
      const randomNumD = singleton.fn(() => Math.random());
      const randomNumFactoryD = factory(randomNumD);

      const factoryInstance = container().get(randomNumFactoryD);
      expectType<TypeEqual<typeof factoryInstance, IFactory<number, []>>>(true);
      expect(typeof factoryInstance.build()).toEqual('number');
    });

    it(`preserves wrapped instance scope - singleton`, async () => {
      const randomNumD = singleton.fn(() => Math.random());
      const randomNumFactoryD = factory(randomNumD);

      const factoryInstance = container().get(randomNumFactoryD);
      expect(factoryInstance.build()).toEqual(factoryInstance.build());
    });

    it(`preserves wrapped instance scope - transient`, async () => {
      const randomNumD = transient.fn(() => Math.random());
      const randomNumFactoryD = factory(randomNumD);

      const factoryInstance = container().get(randomNumFactoryD);
      expect(factoryInstance.build()).not.toEqual(factoryInstance.build());
    });
  });

  describe(`no nested factories`, () => {
    type Request = { requestObj: 'req' };

    class Handler {
      constructor(
        public request: Request,
        public logger: Logger,
        public requestId: string,
        public dbConnection: DbConnection,
      ) {}
    }

    class Logger {
      constructor(public request: Request, public requestId: string) {}
    }

    class Router {
      constructor(public handlersFactory: IFactory<Handler, [Request]>) {}
    }

    class DbConnection {
      public connectionId = v4();
    }

    const requestD = implicit<Request>('req');

    describe(`building definition`, () => {
      it(`cancels moves externals to IFactory params producing InstanceDefinition having void for TExternals`, async () => {
        const requestIdD = value('1');
        const dbConnectionD = singleton.class(DbConnection);
        const loggerD = transient.class(Logger, requestD, requestIdD);
        const handlerD = transient.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);

        const factoryD = factory(handlerD, requestD);
        expectType<
          TypeEqual<typeof factoryD, InstanceDefinition<IFactory<Handler, [Request]>, LifeTime.transient>>
        >(true);
      });
    });

    describe(`using factory`, () => {
      it(`injects working instance of factory`, async () => {
        const requestIdD = value('1');
        const dbConnectionD = singleton.class(DbConnection);
        const loggerD = transient.class(Logger, requestD, requestIdD);
        const handlerD = transient.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
        const routerD = transient.class(Router, factory(handlerD, requestD));

        const cnt = container();
        const result = cnt.get(routerD);
        const externalsValue: Request = { requestObj: 'req' };

        expect(result.handlersFactory.build(externalsValue)).toBeInstanceOf(Handler);
        expect(result.handlersFactory.build(externalsValue).request).toEqual(externalsValue);
        expect(result.handlersFactory.build(externalsValue).requestId).toEqual('1');
      });

      it(`allow overriding external params`, async () => {
        const requestIdD = value('1');
        const dbConnectionD = singleton.class(DbConnection);
        const loggerD = transient.class(Logger, requestD, requestIdD);
        const handlerD = transient.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
        const routerD = transient.class(Router, factory(handlerD, requestD));

        const cnt = container([set(requestIdD, '2')]);
        const result = cnt.get(routerD);
        const externalsValue: Request = { requestObj: 'req' };

        expect(result.handlersFactory.build(externalsValue)).toBeInstanceOf(Handler);
        expect(result.handlersFactory.build(externalsValue).request).toEqual(externalsValue);
        expect(result.handlersFactory.build(externalsValue).requestId).toEqual('2');
      });

      describe('request lifetime support', () => {
        it(`creates new request scope for each IFactory .build call, ex. 1`, async () => {
          const requestIdD = request.fn(() => v4());
          const dbConnectionD = singleton.class(DbConnection);
          const loggerD = transient.class(Logger, requestD, requestIdD);
          const handlerD = transient.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = transient.class(Router, factory(handlerD, requestD));

          const cnt = container();
          const result = cnt.get(routerD);
          const externalsValue: Request = { requestObj: 'req' };

          const handler = result.handlersFactory.build(externalsValue);

          expect(handler).toBeInstanceOf(Handler);
          expect(handler.requestId).toEqual(handler.logger.requestId);
        });

        it(`creates new request scope for each IFactory .build call, ex. 2`, async () => {
          const requestIdD = request.fn(() => v4());
          const dbConnectionD = singleton.class(DbConnection);
          const loggerD = transient.class(Logger, requestD, requestIdD);
          const handlerD = request.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = request.class(Router, factory(handlerD, requestD));

          const cnt = container();
          const result = cnt.get(routerD);
          const externalsValue: Request = { requestObj: 'req' };

          const handlerInstance1 = result.handlersFactory.build(externalsValue);
          const handlerInstance2 = result.handlersFactory.build(externalsValue);

          expect(handlerInstance1.requestId).not.toEqual(handlerInstance2.requestId);
        });

        it(`supports global override`, async () => {
          const requestIdD = request.fn(() => v4());
          const dbConnectionD = singleton.class(DbConnection);
          const loggerD = transient.class(Logger, requestD, requestIdD);
          const handlerD = transient.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = transient.class(Router, factory(handlerD, requestD));

          // TODO: providing requestId override as singleton will create memory leaks in current implementation, where
          //       singletons from child scopes are propagated to parent scopes
          const cnt = container([set(requestIdD, 'overridden')]);
          const result = cnt.get(routerD);
          const externalsValue: Request = { requestObj: 'req' };
          const handler = result.handlersFactory.build(externalsValue);

          expect(handler).toBeInstanceOf(Handler);
          expect(handler.requestId).toEqual('overridden');
        });

        it(`supports global override for factory params`, async () => {
          const requestIdD = request.fn(() => v4());
          const dbConnectionD = singleton.class(DbConnection);
          const loggerD = transient.class(Logger, requestD, requestIdD);
          const handlerD = transient.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = transient.class(Router, factory(handlerD, requestD));
          const override = set(requestD, { requestObj: 'sss' });

          const cnt = container([override]);
          const result = cnt.get(routerD);
          const handler = result.handlersFactory.build({ requestObj: 'req' });

          expect(handler.request).toEqual({ requestObj: 'sss' });
        });

        it(`propagates singletons created by factory to parent scope to make them reusable in next .build calls`, async () => {
          const requestIdD = request.fn(() => v4());
          const dbConnectionD = singleton.class(DbConnection);
          const loggerD = transient.class(Logger, requestD, requestIdD);
          const handlerD = request.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = request.class(Router, factory(handlerD, requestD));

          const cnt = container();
          const result = cnt.get(routerD);

          const handlerInstance1 = result.handlersFactory.build({ requestObj: 'req' });
          const handlerInstance2 = result.handlersFactory.build({ requestObj: 'req' });

          expect(handlerInstance1.dbConnection.connectionId).toEqual(handlerInstance2.dbConnection.connectionId);
        });
      });
    });
  });

  describe(`using definitions with multiple externals provided in different orders`, () => {
    it(`provides correct dependencies`, async () => {
      type Ext1 = string;
      const ext1 = implicit<Ext1>('ext1');

      type Ext2 = string;
      const ext2 = implicit<Ext2>('ext2');

      const consumer1 = (ext1: Ext1, ext2: Ext2): [Ext1, Ext2] => [`consumer1${ext1}`, `consumer2${ext2}`];

      const consumer1Spy = vi.fn(consumer1);
      const consumer1D = transient.partial(consumer1Spy, ext1, ext2);

      const consumer2 = (ext2: Ext2, ext1: Ext1): [Ext2, Ext1] => [`consumer2${ext2}`, `consumer1${ext1}`];

      const consumer2Spy = vi.fn(consumer2);
      const consumer2D = transient.partial(consumer2Spy, ext2, ext1);

      const combined = (consumer1: () => [Ext1, Ext2], consumer2: () => [Ext2, Ext1]): [Ext1, Ext2, Ext2, Ext1] => {
        return [...consumer1(), ...consumer2()];
      };
      const combinedD = transient.fn(combined, consumer1D, consumer2D);

      const compositionRoot = (
        factory: IFactory<[Ext1, Ext2, Ext2, Ext1], [string, string]>,
      ): [Ext1, Ext2, Ext2, Ext1] => {
        return factory.build('ext1', 'ext2');
      };

      const asFactory = factory(combinedD, ext1, ext2);

      const compositionRootD = singleton.fn(compositionRoot, asFactory);

      const cnt = container();
      const result = cnt.get(compositionRootD);
      expect(result).toEqual(['consumer1ext1', 'consumer2ext2', 'consumer2ext2', 'consumer1ext1']);

      expect(consumer1Spy).toHaveBeenCalledWith('ext1', 'ext2');
      expect(consumer2Spy).toHaveBeenCalledWith('ext2', 'ext1');
    });
  });

  describe(`using nested factories`, () => {
    type Request = { requestObj: 'req' };
    type EnvConfig = { mountPoint: string };

    class Handler {
      constructor(
        public request: Request,
        public logger: Logger,
        public requestId: string,
        public dbConnection: DbConnection,
      ) {}
    }

    class Logger {
      constructor(public request: Request, public requestId: string) {}
    }

    class Router {
      constructor(public handlersFactory: IFactory<Handler, [Request]>) {}
    }

    class App {
      constructor(public router: Router, public envConfig: EnvConfig) {}
    }

    class AppsCluster {
      public app1: App;
      public app2: App;

      constructor(modulesFactory: IFactory<App, [EnvConfig]>) {
        this.app1 = modulesFactory.build({ mountPoint: '/app1' });
        this.app2 = modulesFactory.build({ mountPoint: '/app2' });
      }
    }

    class DbConnection {
      public connectionId = v4();
    }

    const requestD = implicit<Request>('req');
    const envConfigD = implicit<EnvConfig>('env');

    it(`creates correct composition root`, async () => {
      const requestIdD = request.fn(() => v4());
      const dbConnectionD = singleton.class(DbConnection);
      const loggerD = transient.class(Logger, requestD, requestIdD);
      const handlerD = request.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
      const routerD = request.class(Router, factory(handlerD, requestD));
      const appModuleD = request.class(App, routerD, envConfigD);
      const appsClusterD = singleton.class(AppsCluster, factory(appModuleD, envConfigD));

      const cnt = container();
      const app = cnt.get(appsClusterD);
      expect(app.app1.envConfig.mountPoint).toEqual('/app1');
      expect(app.app2.envConfig.mountPoint).toEqual('/app2');
    });

    it(`propagates singleton`, async () => {
      const requestIdD = request.fn(() => v4());
      const dbConnectionD = singleton.class(DbConnection);
      const loggerD = transient.class(Logger, requestD, requestIdD);
      const handlerD = request.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
      const routerD = request.class(Router, factory(handlerD, requestD));
      const appModuleD = request.class(App, routerD, envConfigD);
      const appsClusterD = singleton.class(AppsCluster, factory(appModuleD, envConfigD));

      const cnt = container();
      const app = cnt.get(appsClusterD);
      // expect(app.app1.envConfig.mountPoint).toEqual('/app1');
      // expect(app.app2.envConfig.mountPoint).toEqual('/app2');
      //
      // const requestObject = { requestObj: 'req' as const };
      // const handlerInstance11 = app.app1.router.handlersFactory.build(requestObject);
      // const handlerInstance12 = app.app1.router.handlersFactory.build(requestObject);
      // const handlerInstance21 = app.app2.router.handlersFactory.build(requestObject);
      // const handlerInstance22 = app.app2.router.handlersFactory.build(requestObject);
      //
      // expect(handlerInstance11.dbConnection.connectionId).toEqual(handlerInstance12.dbConnection.connectionId);
      // expect(handlerInstance12.dbConnection.connectionId).toEqual(handlerInstance21.dbConnection.connectionId);
      // expect(handlerInstance21.dbConnection.connectionId).toEqual(handlerInstance22.dbConnection.connectionId);
    });

    it.skip(`does not propagate scoped`, async () => {
      // TODO: currently not possible to implement.
      //       new scope for factory needs to be parametrized and therefore is temporal for .build call
      //       we would need to create two kinds of scope - persistent scope for factory where all scoped(scoped should in
      //       theory always contain externals therefore it shouldn't be persisted?) instances will be persisted
      const requestIdD = request.fn(() => v4());
      const dbConnectionD = request.class(DbConnection);
      const loggerD = transient.class(Logger, requestD, requestIdD);
      const handlerD = request.class(Handler, requestD, loggerD, requestIdD, dbConnectionD);
      const wtf = factory(handlerD);
      const routerD = request.class(Router, factory(handlerD));
      const appModuleD = request.class(App, routerD, envConfigD);
      const appsClusterD = singleton.class(AppsCluster, factory(appModuleD));

      const cnt = container();
      const app = cnt.get(appsClusterD);
      expect(app.app1.envConfig.mountPoint).toEqual('/app1');
      expect(app.app2.envConfig.mountPoint).toEqual('/app2');

      const requestObject = { requestObj: 'req' as const };
      const handlerInstance11 = app.app1.router.handlersFactory.build(requestObject);
      const handlerInstance12 = app.app1.router.handlersFactory.build(requestObject);
      const handlerInstance21 = app.app2.router.handlersFactory.build(requestObject);
      const handlerInstance22 = app.app2.router.handlersFactory.build(requestObject);

      expect(handlerInstance11.dbConnection.connectionId).toEqual(handlerInstance12.dbConnection.connectionId);
      expect(handlerInstance21.dbConnection.connectionId).toEqual(handlerInstance22.dbConnection.connectionId);
    });
  });
});

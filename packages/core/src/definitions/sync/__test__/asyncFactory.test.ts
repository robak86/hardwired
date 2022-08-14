import { implicit } from '../implicit.js';
import { factory, IFactory } from '../factory.js';
import { request, singleton, transient } from '../../definitions.js';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/sync/InstanceDefinition.js';
import { container } from '../../../container/Container.js';
import { v4 } from 'uuid';
import { set } from '../../../patching/set.js';
import { asyncFactory, IAsyncFactory } from '../../async/asyncFactory.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { describe, expect, it, vi } from 'vitest';

describe(`factory`, () => {
  describe(`factory without params`, () => {
    it(`creates correct factory`, async () => {
      const randomNumD = singleton.asyncFn(async () => Math.random());
      const randomNumFactoryD = asyncFactory(randomNumD);

      const factoryInstance = container().get(randomNumFactoryD);
      expectType<TypeEqual<typeof factoryInstance, IFactory<Promise<number>, []>>>(true);
      expect(typeof (await factoryInstance.build())).toEqual('number');
    });

    it(`preserves wrapped instance scope - singleton`, async () => {
      const randomNumD = singleton.asyncFn(async () => Math.random());
      const randomNumFactoryD = asyncFactory(randomNumD);

      const factoryInstance = container().get(randomNumFactoryD);
      expect(await factoryInstance.build()).toEqual(await factoryInstance.build());
    });

    it(`preserves wrapped instance scope - transient`, async () => {
      const randomNumD = transient.asyncFn(async () => Math.random());
      const randomNumFactoryD = asyncFactory(randomNumD);

      const factoryInstance = container().get(randomNumFactoryD);
      expect(await factoryInstance.build()).not.toEqual(await factoryInstance.build());
    });
  });

  describe(`using definitions with multiple externals provided in different orders`, () => {
    it(`provides correct dependencies`, async () => {
      const ext1 = implicit<string>('ext1');

      const ext2 = implicit<string>('ext2');

      const consumer1 = async (ext1: string, ext2: string): Promise<[string, string]> => [
        `consumer1${ext1}`,
        `consumer2${ext2}`,
      ];

      const consumer1Spy = vi.fn(consumer1);
      const consumer1D = request.asyncPartial(consumer1Spy, ext1, ext2);

      const consumer2 = async (ext2: string, ext1: string): Promise<[string, string]> => [
        `consumer2${ext2}`,
        `consumer1${ext1}`,
      ];

      const consumer2Spy = vi.fn(consumer2);
      const consumer2D = request.asyncPartial(consumer2Spy, ext2, ext1);

      const combined = async (
        consumer1: () => Promise<[string, string]>,
        consumer2: () => Promise<[string, string]>,
      ): Promise<[string, string, string, string]> => {
        return [...(await consumer1()), ...(await consumer2())];
      };
      const combinedD = request.asyncFn(combined, consumer1D, consumer2D);

      const compositionRoot = async (
        factory: IAsyncFactory<[string, string, string, string], [string, string]>,
      ): Promise<[string, string, string, string]> => {
        return factory.build('ext1', 'ext2');
      };

      const compositionRootD = singleton.asyncFn(compositionRoot, asyncFactory(combinedD, ext1, ext2));

      const cnt = container();
      const result = await cnt.getAsync(compositionRootD);
      expect(result).toEqual(['consumer1ext1', 'consumer2ext2', 'consumer2ext2', 'consumer1ext1']);

      expect(consumer1Spy).toHaveBeenCalledWith('ext1', 'ext2');
      expect(consumer2Spy).toHaveBeenCalledWith('ext2', 'ext1');
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
      constructor(public handlersFactory: IAsyncFactory<Handler, [Request]>) {}
    }

    class DbConnection {
      public connectionId = v4();
    }

    const requestD = implicit<Request>('req');

    describe(`building definition`, () => {
      it(`cancels moves externals to IFactory params producing InstanceDefinition having void for TExternals`, async () => {
        const requestIdD = singleton.asyncFn(async () => '1');
        const dbConnectionD = singleton.asyncClass(DbConnection);
        const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
        const handlerD = transient.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);

        const factoryD = asyncFactory(handlerD, requestD);
        expectType<
          TypeEqual<typeof factoryD, InstanceDefinition<IAsyncFactory<Handler, [Request]>, LifeTime.transient>>
        >(true);
      });
    });

    describe(`using factory`, () => {
      it(`injects working instance of factory`, async () => {
        const requestIdD = singleton.asyncFn(async () => '1');
        const dbConnectionD = singleton.asyncClass(DbConnection);
        const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
        const handlerD = transient.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);
        const routerD = transient.asyncClass(Router, asyncFactory(handlerD, requestD));

        const cnt = container();
        const result = await cnt.getAsync(routerD);
        const externalsValue: Request = { requestObj: 'req' };

        const handler = await result.handlersFactory.build(externalsValue);
        expect(handler).toBeInstanceOf(Handler);
        expect(handler.request).toEqual(externalsValue);
        expect(handler.requestId).toEqual('1');
      });

      describe('request lifetime support', () => {
        it(`creates new request scope for each IFactory .build call, ex. 1`, async () => {
          const requestIdD = request.asyncFn(async () => v4());
          const dbConnectionD = singleton.asyncClass(DbConnection);
          const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
          const handlerD = transient.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = transient.asyncClass(Router, asyncFactory(handlerD, requestD));

          const factoryD = asyncFactory(handlerD);

          const cnt = container();
          const result = await cnt.getAsync(routerD);
          const externalsValue: Request = { requestObj: 'req' };

          const handler = await result.handlersFactory.build(externalsValue);

          expect(handler).toBeInstanceOf(Handler);
          expect(handler.requestId).toEqual(handler.logger.requestId);
        });

        it(`creates new request scope for each IFactory .build call, ex. 2`, async () => {
          const requestIdD = request.asyncFn(async () => v4());
          const dbConnectionD = singleton.asyncClass(DbConnection);
          const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
          const handlerD = transient.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = transient.asyncClass(Router, asyncFactory(handlerD, requestD));

          const cnt = container();
          const result = await cnt.getAsync(routerD);
          const externalsValue: Request = { requestObj: 'req' };

          const handlerInstance1 = await result.handlersFactory.build(externalsValue);
          const handlerInstance2 = await result.handlersFactory.build(externalsValue);

          expect(handlerInstance1.requestId).not.toEqual(handlerInstance2.requestId);
        });

        it(`supports global override`, async () => {
          const requestIdD = request.asyncFn(async () => v4());
          const dbConnectionD = singleton.asyncClass(DbConnection);
          const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
          const handlerD = transient.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = transient.asyncClass(Router, asyncFactory(handlerD, requestD));

          // TODO: providing requestId override as singleton will create memory leaks in current implementation, where
          //       singletons from child scopes are propagated to parent scopes
          const cnt = container([set(requestIdD, 'overridden')]);
          const result = await cnt.getAsync(routerD);
          const externalsValue: Request = { requestObj: 'req' };
          const handler = await result.handlersFactory.build(externalsValue);

          expect(handler).toBeInstanceOf(Handler);
          expect(handler.requestId).toEqual('overridden');
        });

        it(`propagates singletons created by factory to parent scope to make them reusable in next .build calls`, async () => {
          const requestIdD = request.asyncFn(async () => v4());
          const dbConnectionD = singleton.asyncClass(DbConnection);
          const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
          const handlerD = transient.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);
          const routerD = transient.asyncClass(Router, asyncFactory(handlerD, requestD));

          const cnt = container();
          const result = await cnt.getAsync(routerD);
          const externalsValue: Request = { requestObj: 'req' };

          const handlerInstance1 = await result.handlersFactory.build(externalsValue);
          const handlerInstance2 = await result.handlersFactory.build(externalsValue);

          expect(handlerInstance1.dbConnection.connectionId).toEqual(handlerInstance2.dbConnection.connectionId);
        });
      });
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
      constructor(public handlersFactory: IAsyncFactory<Handler, [Request]>) {}
    }

    class App {
      constructor(public router: Router, public envConfig: EnvConfig) {}
    }

    class AppsCluster {
      public app1?: App;
      public app2?: App;

      constructor(private modulesFactory: IAsyncFactory<App, [EnvConfig]>) {}

      async mountApps() {
        this.app1 = await this.modulesFactory.build({ mountPoint: '/app1' });
        this.app2 = await this.modulesFactory.build({ mountPoint: '/app2' });
      }
    }

    class DbConnection {
      public connectionId = v4();
    }

    const requestD = implicit<Request>('req');
    const envConfigD = implicit<EnvConfig>('env');

    it(`creates correct composition root`, async () => {
      const requestIdD = request.asyncFn(async () => v4());
      const dbConnectionD = singleton.asyncClass(DbConnection);
      const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
      const handlerD = request.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);
      const routerD = request.asyncClass(Router, asyncFactory(handlerD, requestD));
      const appModuleD = request.asyncClass(App, routerD, envConfigD);
      const appsClusterD = singleton.asyncClass(AppsCluster, asyncFactory(appModuleD, envConfigD));

      const cnt = container();
      const app = await cnt.getAsync(appsClusterD);
      await app.mountApps();

      expect(app.app1?.envConfig.mountPoint).toEqual('/app1');
      expect(app.app2?.envConfig.mountPoint).toEqual('/app2');
    });

    it(`propagates singleton`, async () => {
      const requestIdD = request.asyncFn(async () => v4());
      const dbConnectionD = singleton.asyncClass(DbConnection);
      const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
      const handlerD = request.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);
      const routerD = request.asyncClass(Router, asyncFactory(handlerD, requestD));
      const appModuleD = request.asyncClass(App, routerD, envConfigD);
      const appsClusterD = singleton.asyncClass(AppsCluster, asyncFactory(appModuleD, envConfigD));

      const cnt = container();
      const app = await cnt.getAsync(appsClusterD);
      await app.mountApps();

      expect(app.app1?.envConfig.mountPoint).toEqual('/app1');
      expect(app.app2?.envConfig.mountPoint).toEqual('/app2');

      const requestObject = { requestObj: 'req' as const };
      const handlerInstance11 = await app.app1?.router.handlersFactory.build(requestObject);
      const handlerInstance12 = await app.app1?.router.handlersFactory.build(requestObject);
      const handlerInstance21 = await app.app2?.router.handlersFactory.build(requestObject);
      const handlerInstance22 = await app.app2?.router.handlersFactory.build(requestObject);

      expect(handlerInstance11?.dbConnection.connectionId).toEqual(handlerInstance12?.dbConnection.connectionId);
      expect(handlerInstance12?.dbConnection.connectionId).toEqual(handlerInstance21?.dbConnection.connectionId);
      expect(handlerInstance21?.dbConnection.connectionId).toEqual(handlerInstance22?.dbConnection.connectionId);
    });

    it.skip(`does not propagate scoped`, async () => {
      // TODO: currently not possible to implement.
      //       new scope for factory needs to be parametrized and therefore is temporal for .build call
      //       we would need to create two kinds of scope - persistent scope for factory where all scoped(scoped should in
      //       theory always contain externals therefore it shouldn't be persisted?) instances will be persisted
      const requestIdD = request.asyncFn(async () => v4());
      const dbConnectionD = singleton.asyncClass(DbConnection);
      const loggerD = transient.asyncClass(Logger, requestD, requestIdD);
      const handlerD = request.asyncClass(Handler, requestD, loggerD, requestIdD, dbConnectionD);
      const routerD = request.asyncClass(Router, asyncFactory(handlerD));
      const appModuleD = request.asyncClass(App, routerD, envConfigD);
      const appsClusterD = singleton.asyncClass(AppsCluster, asyncFactory(appModuleD));

      const cnt = container();
      const app = await cnt.getAsync(appsClusterD);
      await app.mountApps();

      expect(app.app1?.envConfig.mountPoint).toEqual('/app1');
      expect(app.app2?.envConfig.mountPoint).toEqual('/app2');

      const requestObject = { requestObj: 'req' as const };
      const handlerInstance11 = await app.app1?.router.handlersFactory.build(requestObject);
      const handlerInstance12 = await app.app1?.router.handlersFactory.build(requestObject);
      const handlerInstance21 = await app.app2?.router.handlersFactory.build(requestObject);
      const handlerInstance22 = await app.app2?.router.handlersFactory.build(requestObject);

      expect(handlerInstance11?.dbConnection.connectionId).toEqual(handlerInstance12?.dbConnection.connectionId);
      expect(handlerInstance21?.dbConnection.connectionId).toEqual(handlerInstance22?.dbConnection.connectionId);
    });
  });
});

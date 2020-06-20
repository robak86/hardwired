import { DefinitionsSet } from '@hardwired/di';
import { HttpRequest, IApplication, IApplicationRoute, IMiddleware } from '@roro/s-middleware';
import { ServerModuleBuilder } from '../ServerModuleBuilder';
import { ApplicationResolver } from '../../resolvers/ApplicationResolver';
import { serverUnit } from '../../testing/helpers';
import { MiddlewareResolver } from '../../resolvers/MiddlewareResolver';

describe(`ServerModuleBuilder`, () => {
  class DummyApplication implements IApplication {
    addRoute(method: any, path: string, handler: any) {
      throw new Error('Implement me');
    }

    replaceRoutes(routes: IApplicationRoute[]) {}

    run(): any {
      throw new Error('Implement me');
    }
  }

  describe(`.app`, () => {
    describe(`types`, () => {
      it(`requires class inheriting from IApplication`, async () => {
        class WrongClass {}

        const m = serverUnit('test').app('app', DummyApplication);
        // @ts-expect-error
        const m2 = serverUnit('test').app('app', WrongClass);
      });
    });

    it(`registers new ApplicationResolver`, async () => {
      const registry = DefinitionsSet.empty('empty');
      // const extendDeclarationsSpy = jest.spyOn(registry, 'extendDeclarations');

      const builder = new ServerModuleBuilder(registry).app('app', DummyApplication);

      expect(builder.registry.declarations.get('app')).toBeInstanceOf(ApplicationResolver);
    });
  });

  describe(`.middleware`, () => {
    describe(`types`, () => {
      it(`requires class inheriting from IApplication`, async () => {
        class WrongClass {}

        const m = serverUnit('test').middleware('middleware', DummyApplication);

        // const m2 = serverUnit('test').middleware('middleware', WrongClass);
      });
    });

    it(`registers new ApplicationResolver`, async () => {
      const registry = DefinitionsSet.empty('empty');
      const builder = new ServerModuleBuilder(registry).middleware('middleware', DummyApplication);

      expect(builder.registry.declarations.get('middleware')).toBeInstanceOf(MiddlewareResolver);
    });

    it(`works`, async () => {
      class A implements IMiddleware<{ a: number }> {
        constructor(private request: HttpRequest) {}

        run() {
          return { a: 1 };
        }
      }

      class B implements IMiddleware<{ b: number }> {
        run() {
          return { b: 1 };
        }
      }

      // type MiddlewareInput = { z: number };
      //
      // class Middleware implements IMiddleware<MiddlewareInput, { y: number }, any> {
      //   processRequest(input: MiddlewareInput): { y: number } {
      //     // return { ...input, y: 'sdf' };
      //     // return undefined
      //     return { y: 123 };
      //   }
      // }
      // const iMiddleware = compose(c);

      const m = serverUnit('test').middleware('middleware', A, ctx => [ctx.request]);
    });
  });
});

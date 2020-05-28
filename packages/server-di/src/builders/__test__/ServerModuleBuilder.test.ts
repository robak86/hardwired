import { DefinitionsSet } from '@hardwired/di';
import { IApplication } from '../../types/App';
import { IHandler, IMiddleware } from '../../types/Middleware';
import { serverUnit } from '../../testing/helpers';
import { compose, ServerModuleBuilder } from '../ServerModuleBuilder';
import { ApplicationResolver } from '../../resolvers/ApplicationResolver';

describe(`ServerModuleBuilder`, () => {
  class DummyApplication implements IApplication {
    addRoute(method: any, path: string, handler: IHandler<any, any>) {
      throw new Error('Implement me');
    }

    processRequest(input: any): any {
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
        // class WrongClass {}
        //
        // const m = serverUnit('test').middleware('middleware', DummyApplication);
        //
        // // @ts-expect-error
        // const m2 = serverUnit('test').middleware('middleware', WrongClass);
      });
    });

    it(`registers new ApplicationResolver`, async () => {
      const registry = DefinitionsSet.empty('empty');
      // const builder = new ServerModuleBuilder(registry).middleware('middleware', DummyApplication);

      // expect(builder.registry.declarations.get('middleware')).toBeInstanceOf(MiddlewareResolver);
    });

    it(`works`, async () => {
      const a: IMiddleware<{ a: number }, { a: number }, any> = null as any;
      const b: IMiddleware<{ a: number }, { a: number; b: number }, any> = null as any;
      const c: IMiddleware<{ a: number }, { z: number }, any> = null as any;

      type MiddlewareInput = { z: number };

      class Middleware implements IMiddleware<MiddlewareInput, { y: number }, any> {
        processRequest(input: MiddlewareInput): { y: number } {
          // return { ...input, y: 'sdf' };
          // return undefined
          return { y: 123 };
        }
      }
      const iMiddleware = compose(c);

      const m = serverUnit('test')
        .middleware('middleware', Middleware, ctx => compose(b, c))
        .middleware('middleware', Middleware, ctx => compose(ctx.middleware, c));
    });
  });
});

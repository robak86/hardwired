import { DefinitionsSet } from '@hardwired/di';
import { IApplication } from '../../types/App';
import { IHandler } from '../../types/Middleware';
import { serverUnit } from '../../testing/helpers';
import { ServerModuleBuilder } from '../ServerModuleBuilder';
import { ApplicationResolver } from '../../resolvers/ApplicationResolver';
import { MiddlewareResolver } from '../../resolvers/MiddlewareResolver';

describe(`ServerModuleBuilder`, () => {
  class DummyApplication implements IApplication {
    addRoute(method, path: string, handler: IHandler<any, any>) {
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
        class WrongClass {}

        const m = serverUnit('test').middleware('middleware', DummyApplication);

        // @ts-expect-error
        const m2 = serverUnit('test').middleware('middleware', WrongClass);
      });
    });

    it(`registers new ApplicationResolver`, async () => {
      const registry = DefinitionsSet.empty('empty');
      const builder = new ServerModuleBuilder(registry).middleware('middleware', DummyApplication);

      expect(builder.registry.declarations.get('middleware')).toBeInstanceOf(MiddlewareResolver);
    });
  });
});

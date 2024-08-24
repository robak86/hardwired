import { AbstractServiceLocatorDecorator } from '../AbstractServiceLocatorDecorator.js';
import { fn } from '../../definitions.js';
import { IServiceLocator } from '../../../container/IContainer.js';
import { implicit } from '../../sync/implicit.js';
import { container } from '../../../container/Container.js';

describe(`CustomDefinitions`, () => {
  const bodyD = implicit<any>('httpBody');

  class GuardContext extends AbstractServiceLocatorDecorator {
    constructor(locator: IServiceLocator) {
      super(locator);
    }

    get body() {
      return this.use(bodyD);
    }
  }

  const guard = <T>(factory: (context: GuardContext) => T) => {
    return fn.scoped(use => () => factory(new GuardContext(use)));
  };

  it('returns correct instance', () => {
    const use = container();

    const myGuard = guard(context => {
      return `body: ${JSON.stringify(context.body)}`;
    });

    const result = use.withScope(scope => {
      scope.provide(bodyD, { body: '123' });
      const g = scope.use(myGuard);
      return g();
    });

    expect(result).toBe('body: {"body":"123"}');
  });

  it(`works with destructuring`, async () => {
    const use = container();

    const myGuard = guard(context => {
      return `body: ${JSON.stringify(context.body)}`;
    });

    const result = use.withScope(({ provide, use }) => {
      provide(bodyD, { body: '123' });
      const g = use(myGuard);
      return g();
    });

    expect(result).toBe('body: {"body":"123"}');
  });
});

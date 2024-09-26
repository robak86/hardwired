import { AbstractServiceLocatorDecorator } from '../AbstractServiceLocatorDecorator.js';
import { fn } from '../../definitions.js';

import { unbound } from '../../sync/unbound.js';
import { container } from '../../../container/Container.js';
import { LifeTime } from '../LifeTime.js';

describe(`CustomDefinitions`, () => {
  const bodyD = unbound<any>('httpBody');

  class GuardContext extends AbstractServiceLocatorDecorator<LifeTime.scoped> {
    get body() {
      return this.use(bodyD);
    }
  }

  const guard = <T>(factory: (context: GuardContext) => T) => {
    return fn.scoped(use => () => factory(new GuardContext(use)), { customMetaProperty: 123 });
  };

  it('returns correct instance', () => {
    const use = container.new();

    const myGuard = guard(context => {
      return `body: ${JSON.stringify(context.body)}`;
    });

    expect(myGuard.meta?.customMetaProperty).toEqual(123);

    const result = use.withScope(scope => {
      scope.provide(bodyD, { body: '123' });
      const g = scope.use(myGuard);
      return g();
    });

    expect(result).toBe('body: {"body":"123"}');
  });

  it(`works with destructuring`, async () => {
    const use = container.new();

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

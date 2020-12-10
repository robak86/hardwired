import { ModuleBuilder, unit } from '../../module/ModuleBuilder';
import { singleton } from '../../resolvers/ClassSingletonResolver';
import { TestClass } from '../../testing/ArgsDebug';
import { value } from '../../resolvers/ValueResolver';
import { container } from '../Container';
import { serviceLocator } from '../../resolvers/ServiceLocatorResolver';

describe(`ServiceLocator`, () => {
  describe(`injections`, () => {
    it(`returns instances from injected modules`, async () => {
      const child = ModuleBuilder.empty('child')
        .define('someNumber', value(123))
        .define('someString', value('some content'));

      const m = ModuleBuilder.empty('root')
        .define('import', child)
        .define('locator', serviceLocator())
        .define('cls', singleton(TestClass), ['import.someNumber', 'import.someString']);

      const mWithInjection = m.inject(child.replace('someNumber', value(456)));
      const c = container();

      const locator = c.get(m, 'locator');
      const cls = locator.withScope(({ get }) => get(mWithInjection, 'cls'));

      expect(cls.someNumber).toEqual(456);
      expect(cls.someString).toEqual('some content');
    });
  });
});

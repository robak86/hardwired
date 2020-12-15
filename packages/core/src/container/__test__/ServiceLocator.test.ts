import { ModuleBuilder, unit } from '../../module/ModuleBuilder';
import { singleton } from '../../resolvers/ClassSingletonResolver';
import { TestClassArgs2 } from '../../testing/ArgsDebug';
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
        .define('cls', singleton(TestClassArgs2), ['import.someNumber', 'import.someString']);

      const c = container();
      c.inject(child.replace('someNumber', value(456)));

      console.log(c.get(m, 'cls'));

      const locator = c.get(m, 'locator');
      const cls = locator.withScope(({ get }) => get(m, 'cls'));

      expect(cls.someNumber).toEqual(456);
      expect(cls.someString).toEqual('some content');
    });
  });
});

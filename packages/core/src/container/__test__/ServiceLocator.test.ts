import { ModuleBuilder } from '../../module/ModuleBuilder';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { container } from '../Container';
import { serviceLocator } from '../../strategies/ServiceLocatorStrategy';
import { singleton } from '../../strategies/SingletonStrategyLegacy';

describe(`ServiceLocator`, () => {
  describe(`overrides`, () => {
    it(`returns instances from overrides modules`, async () => {
      const child = ModuleBuilder.empty()
        .define('someNumber', singleton, () => 123)
        .define('someString', singleton, () => 'some content')
        .build();

      const m = ModuleBuilder.empty()
        .import('imported', child)
        .define('locator', serviceLocator())
        .define('cls', singleton, ({ imported }) => new TestClassArgs2(imported.someNumber, imported.someString))
        .build();

      const c = container({ scopeOverrides: [child.replace('someNumber', () => 456)] });

      const locator = c.get(m, 'locator');
      const cls = locator.withRequestScope(({ get }) => get(m, 'cls'));

      expect(cls.someNumber).toEqual(456);
      expect(cls.someString).toEqual('some content');
    });
  });

  describe(`asObject`, () => {
    describe(`overrides`, () => {
      it(`returns instances from overrides modules`, async () => {
        const child = ModuleBuilder.empty()
          .define('someNumber', singleton, () => 123)
          .define('someString', singleton, () => 'some content')
          .build();

        const m = ModuleBuilder.empty()
          .import('imported', child)
          .define('locator', serviceLocator())
          .define('cls', singleton, ({ imported }) => new TestClassArgs2(imported.someNumber, imported.someString))
          .build();

        const c = container({ scopeOverrides: [child.replace('someNumber', () => 456)] });

        const locator = c.get(m, 'locator');
        const { cls } = locator.asObject(m);

        expect(cls.someNumber).toEqual(456);
        expect(cls.someString).toEqual('some content');
      });
    });
  });
});

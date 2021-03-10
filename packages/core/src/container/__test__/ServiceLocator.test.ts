import { ModuleBuilder } from '../../module/ModuleBuilder';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { container } from '../Container';
import { serviceLocator } from '../../resolvers/ServiceLocatorResolver';
import { singleton } from '../../strategies/SingletonStrategy';

describe(`ServiceLocator`, () => {
  describe(`overrides`, () => {
    it(`returns instances from overrides modules`, async () => {
      const child = ModuleBuilder.empty()
        .define('someNumber', () => 123, singleton)
        .define('someString', () => 'some content', singleton)
        .build();

      const m = ModuleBuilder.empty()
        .import('imported', child)
        .define('locator', serviceLocator())
        .define('cls', ({ imported }) => new TestClassArgs2(imported.someNumber, imported.someString), singleton)
        .build();

      const c = container({ overrides: [child.replace('someNumber', () => 456)] });

      const locator = c.get(m, 'locator');
      const cls = locator.withScope(({ get }) => get(m, 'cls'));

      expect(cls.someNumber).toEqual(456);
      expect(cls.someString).toEqual('some content');
    });
  });

  describe(`asObject`, () => {
    describe(`overrides`, () => {
      it(`returns instances from overrides modules`, async () => {
        const child = ModuleBuilder.empty()
          .define('someNumber', () => 123, singleton)
          .define('someString', () => 'some content', singleton)
          .build();

        const m = ModuleBuilder.empty()
          .import('imported', child)
          .define('locator', serviceLocator())
          .define('cls', ({ imported }) => new TestClassArgs2(imported.someNumber, imported.someString), singleton)
          .build();

        const c = container({ overrides: [child.replace('someNumber', () => 456)] });

        const locator = c.get(m, 'locator');
        const { cls } = locator.asObject(m);

        expect(cls.someNumber).toEqual(456);
        expect(cls.someString).toEqual('some content');
      });
    });
  });
});

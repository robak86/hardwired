
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { container } from '../Container';
import { serviceLocator, singleton } from "../../strategies/factory/strategies";
import { replace } from "../../patching/replace";


describe(`ServiceLocator`, () => {
  describe(`overrides`, () => {
    it(`returns instances from overrides modules`, async () => {
      const someNumber = singleton.fn(() => 123)
      const someString = singleton.fn(() => 'some content')

      const clsDef = singleton.class(TestClassArgs2, [someNumber, someString])


      const c = container({ scopeOverrides: [replace(someNumber, singleton.fn(() => 456))] });

      const locator = c.get(serviceLocator);
      const cls = locator.withRequestScope(({ get }) => get(clsDef));

      expect(cls.someNumber).toEqual(456);
      expect(cls.someString).toEqual('some content');
    });
  });

  describe(`asObject`, () => {
    describe(`overrides`, () => {
      it(`returns instances from overrides modules`, async () => {
        // const child = ModuleBuilder.empty()
        //   .define('someNumber', singleton, () => 123)
        //   .define('someString', singleton, () => 'some content')
        //   .build();
        //
        // const m = ModuleBuilder.empty()
        //   .import('imported', child)
        //   .define('locator', serviceLocator())
        //   .define('cls', singleton, ({ imported }) => new TestClassArgs2(imported.someNumber, imported.someString))
        //   .build();
        //
        // const c = container({ scopeOverrides: [child.replace('someNumber', () => 456)] });
        //
        // const locator = c.get(m, 'locator');
        // const { cls } = locator.asObject(m);
        //
        // expect(cls.someNumber).toEqual(456);
        // expect(cls.someString).toEqual('some content');
      });
    });
  });
});

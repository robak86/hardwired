import { expectType, TypeEqual } from 'ts-expect';
import { module, ModuleBuilder } from '../ModuleBuilder';

import { container } from '../../container/Container';
import { Module } from '../Module';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { transient } from '../../strategies/TransientStrategy';
import { request } from '../../strategies/RequestStrategy';
import { ModulePatch } from '../ModulePatch';
import { singleton } from '../../strategies/SingletonStrategy';
import { ClassType } from '../../utils/ClassType';
import { BoxedValue } from '../../__test__/BoxedValue';

describe(`ModuleBuilder`, () => {
  describe('bind', () => {
    describe(`class has constructor params`, () => {
      it(`registers correct entry in module`, async () => {
        // class SomeClass {
        //   constructor(public a: number, public b: string) {}
        // }
        //
        // const extra = ModuleBuilder.empty()
        //   .define('b', singleton, () => 'valueFromImportedModule')
        //   .freeze();
        //
        // const m = ModuleBuilder.empty()
        //   .import('imported', extra)
        //   .define('a', singleton, () => 1)
        //   .define('z', singleton, () => 'sdf')
        //   .bind3('kls', SomeClass, ['a', 'imported.b'])
        //   .freeze();
        //
        // const c = container().get(m, 'kls');
        //
        // expectType<SomeClass>(c);
        // expect(c.a).toEqual(1);
        // expect(c.b).toEqual('valueFromImportedModule');
      });
    });

    describe(`class does not have any constructor params`, () => {
      it(`registers correct entry in module`, async () => {
        class SomeClass {
          constructor() {}
        }

        const extra = ModuleBuilder.empty()
          .define('b', singleton, () => 'valueFromImportedModule')
          .freeze();

        const m = ModuleBuilder.empty()
          .import('imported', extra)
          .define('a', singleton, () => 1)
          .define('z', singleton, () => 'sdf')
          .bind('kls', singleton, SomeClass, ['z'])
          .freeze();

        const c = container().get(m, 'kls');

        expectType<SomeClass>(c);
      });
    });
  });

  describe(`define`, () => {
    it(`creates correct type`, async () => {
      const m = ModuleBuilder.empty()
        .define('key1', singleton, () => 123)
        .define('key2', singleton, () => true)
        .define('key3', singleton, () => 'string')
        .define('key4', singleton, () => () => 'someString')
        .build();

      type ExpectedType = {
        key1: number;
        key2: boolean;
        key3: string;
        key4: () => 'someString';
      };

      type Actual = Module.Materialized<typeof m>;

      expectType<TypeEqual<Actual, ExpectedType>>(true);
    });

    it(`providing deps`, async () => {
      const m2 = ModuleBuilder.empty()
        .define('string', singleton, () => 'string')
        .define('number', singleton, () => 123);

      m2.define('cls', singleton, ({ number, string }) => new TestClassArgs2(number, string)); //, ['number', 'string']);

      // @ts-expect-error - dependencies were passed in the wrong order
      m2.define('cls', singleton, ({ number, string }) => new TestClassArgs2(string, number)); //, ['string', 'number']);

      // @ts-expect-error - on of the dependencies is missing
      m2.define('cls', singleton, ({ number }) => new TestClassArgs2(number)); //, ['number']);

      // @ts-expect-error - dependencies array is empty
      m2.define('cls', singleton, () => new TestClassArgs2()); //, []);
    });

    it(`providing deps from imported modules`, async () => {
      const child = ModuleBuilder.empty()
        .define('someNumber', singleton, () => 123)
        .define('someString', singleton, () => 'content')
        .build();

      const m2 = ModuleBuilder.empty().import('imported', () => child);

      m2.define('cls', singleton, ({ imported }) => new TestClassArgs2(imported.someNumber, imported.someString));

      // @ts-expect-error - dependencies were passed in the wrong order
      m2.define('cls', singleton, ({ imported }) => new TestClassArgs2(imported.someString, imported.someNumber));

      // @ts-expect-error - on of the dependencies is missing
      m2.define('cls', singleton, ({ imported }) => new TestClassArgs2(imported.someNumber));

      // @ts-expect-error - dependencies array is empty
      m2.define('cls', singleton, ({ imported }) => new TestClassArgs2()); //, []);
    });

    it(`creates correct types for imports`, async () => {
      const m1 = ModuleBuilder.empty()
        .define('key1', singleton, () => 123)
        .build();

      const m2 = ModuleBuilder.empty()
        .import('imported', m1)
        .define('key1', singleton, () => 123)
        .build();

      type ExpectedType = {
        key1: number;
      };

      type Actual = Module.Materialized<typeof m2>;

      expectType<TypeEqual<Actual['imported'], ExpectedType>>(true);
    });

    it(`creates correct types for replace`, async () => {
      const m1 = ModuleBuilder.empty()
        .define('key1', singleton, () => 123)
        .build();

      const m2 = ModuleBuilder.empty()
        .import('imported', m1)
        .define('key2', singleton, () => 'string')
        .define('key1', singleton, () => 123)
        .build();

      const replaced = m2.replace('key1', () => 123);

      type ExpectedType = {
        imported: {
          key1: number;
        };
        key2: string;
        key1: number;
      };

      expectType<TypeEqual<ModulePatch.Materialized<typeof replaced>, ExpectedType>>(true);

      // @ts-expect-error - replacing is only allowed for the same types (cannot replace int with string)
      m2.replace('key1', () => 'sdf');
    });
  });

  describe(`override`, () => {
    it(`replaces child module`, async () => {
      const child1 = ModuleBuilder.empty()
        .define('key1', singleton, () => 123)
        .define('key2', singleton, () => 'someString')
        .build();

      const root = ModuleBuilder.empty()
        .import('imported', child1)
        .define('cls', singleton, ({ imported }) => new TestClassArgs2(imported.key1, imported.key2))
        .build();

      const mPatch = child1.replace('key2', () => 'replacedString');

      const c = container({
        scopeOverrides: [mPatch],
      });

      const classInstance = c.get(root, 'cls');
      expect(classInstance.someString).toEqual('replacedString');
    });

    it(`replaces all imports of given module`, async () => {
      const root = ModuleBuilder.empty()
        .import('import1', () => child1)
        .import('import2', () => child1)
        .define('cls', singleton, ({ import1, import2 }) => new TestClassArgs2(import1.key1, import2.key2))
        .build();

      const child1 = ModuleBuilder.empty()
        .define('key1', singleton, () => 123)
        .define('key2', singleton, () => 'someString')
        .build();

      const c = container({
        scopeOverrides: [
          child1 //breakme
            .replace('key1', () => 456)
            .replace('key2', () => 'replacedString'),
        ],
      });

      const classInstance = c.get(root, 'cls');
      expect(classInstance.someNumber).toEqual(456);
      expect(classInstance.someString).toEqual('replacedString');
    });
  });

  describe(`isEqual`, () => {
    it(`returns false for two newly created empty modules`, async () => {
      const m1 = module().build();
      const m2 = module().build();
      expect(m1.isEqual(m2)).toEqual(false);
    });

    it(`returns false for module extended with a new definition`, async () => {
      const m1 = module().define('a', singleton, () => 'string');
      const m2 = m1.define('b', singleton, () => 'someOtherString').build();
      expect(m1.isEqual(m2)).toEqual(false);
    });

    it(`returns true for module with replaced value`, async () => {
      const m1 = module()
        .define('a', singleton, () => 'string')
        .build();

      const m2 = m1.replace('a', () => 'someOtherString');
      expect(m1.isEqual(m2)).toEqual(true);
    });
  });

  describe(`replace`, () => {
    describe(`types`, () => {
      it(`does not allow to replace not existing definition`, async () => {
        const emptyModule = module().build();

        try {
          // @ts-expect-error - invalid key
          emptyModule.replace('should raise compilation error', () => 1);
        } catch (err) {
          // catch runtime error related to missing key
        }
      });

      it(`requires that new definition extends the original`, async () => {
        const emptyModule = module()
          .define('someString', singleton, () => 'string')
          .build();

        // @ts-expect-error - value(1) is not compatible with string
        emptyModule.replace('someString', () => 1);
      });
    });
  });

  describe(`.decorate`, () => {
    it(`preserves module identity`, async () => {
      const m = module()
        .define('a', singleton, () => 1)
        .build();

      const mWithDecorator = m.decorate('a', a => a + 1);

      expect(m.isEqual(mWithDecorator));
    });
  });

  describe(`.apply`, () => {
    it(`acts like replace in terms of module identity`, async () => {
      const m = module()
        .define('a', singleton, () => new BoxedValue(1))
        .build();

      const patchedMWithApply = m.apply('a', a => (a.value += 1));

      expect(m.isEqual(patchedMWithApply));
    });
  });

  describe(`freezing`, () => {
    it(`throws if one tries to extend module which is already frozen`, async () => {
      const prevModule = module();
      const def1 = prevModule.define('a', singleton, () => 1).build();
      expect(() => prevModule.define('b', singleton, () => 2)).toThrow();
    });

    it(`throws if one tries to freeze a parent module while child module is frozen`, async () => {
      const prefModule = module();
      const nextModule = prefModule.define('a', singleton, () => 1).build();
      expect(() => prefModule.build()).toThrow();
    });

    it(`produces module with next unique id`, async () => {
      const prevModule = module();
      const frozen = prevModule.build();
      expect(prevModule.moduleId.revision).not.toEqual(frozen.moduleId.revision);
    });
  });

  describe(`materializing context`, () => {
    it(`uses the same instance for each definition`, async () => {
      const objCalls: any[] = [];
      const a = module()
        .define('a', singleton, obj => {
          objCalls.push(obj);
          return 1;
        })
        .define('b', singleton, obj => {
          objCalls.push(obj);
          return 2;
        })
        .define('c', singleton, obj => {
          objCalls.push(obj);
          return 3;
        })
        .build();

      const c = container();
      const obj = c.asObject(a);

      objCalls.reduce((prev, current) => {
        expect(prev).toBe(current);
        return current;
      }, obj);
    });
  });
});

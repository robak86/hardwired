import { expectType, TypeEqual } from 'ts-expect';
import { module, ModuleBuilder } from '../ModuleBuilder';

import { container } from '../../container/Container';
import { Module } from '../../resolvers/abstract/Module';
import { TestClassArgs2 } from '../../__test__/ArgsDebug';
import { transient } from '../../strategies/TransientStrategy';
import { request } from '../../strategies/RequestStrategy';
import { singleton } from '../../strategies/SingletonStrategy';
import { ModulePatch } from '../../resolvers/abstract/ModulePatch';

describe(`ModuleBuilder`, () => {
  describe(`define`, () => {
    it(`creates correct type`, async () => {
      const m = ModuleBuilder.empty()
        .define('key1', () => 123)
        .define('key2', () => true)
        .define('key3', () => 'string')
        .define('key4', () => () => 'someString')
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
        .define('string', () => 'string')
        .define('number', () => 123);

      m2.define('cls', ({ number, string }) => new TestClassArgs2(number, string)); //, ['number', 'string']);

      // @ts-expect-error - dependencies were passed in the wrong order
      m2.define('cls', ({ number, string }) => new TestClassArgs2(string, number)); //, ['string', 'number']);

      // @ts-expect-error - on of the dependencies is missing
      m2.define('cls', ({ number }) => new TestClassArgs2(number)); //, ['number']);

      // @ts-expect-error - dependencies array is empty
      m2.define('cls', () => new TestClassArgs2()); //, []);
    });

    it(`providing deps from imported modules`, async () => {
      const child = ModuleBuilder.empty()
        .define('someNumber', () => 123)
        .define('someString', () => 'content')
        .build();

      const m2 = ModuleBuilder.empty().import('imported', () => child);

      m2.define('cls', ({ imported }) => new TestClassArgs2(imported.someNumber, imported.someString));

      // @ts-expect-error - dependencies were passed in the wrong order
      m2.define('cls', ({ imported }) => new TestClassArgs2(imported.someString, imported.someNumber));

      // @ts-expect-error - on of the dependencies is missing
      m2.define('cls', ({ imported }) => new TestClassArgs2(imported.someNumber));

      // @ts-expect-error - dependencies array is empty
      m2.define('cls', ({ imported }) => new TestClassArgs2()); //, []);
    });

    it(`creates correct types for imports`, async () => {
      const m1 = ModuleBuilder.empty()
        .define('key1', () => 123)
        .build();

      const m2 = ModuleBuilder.empty()
        .import('imported', m1)
        .define('key1', () => 123)
        .build();

      type ExpectedType = {
        key1: number;
      };

      type Actual = Module.Materialized<typeof m2>;

      expectType<TypeEqual<Actual['imported'], ExpectedType>>(true);
    });

    it(`creates correct types for replace`, async () => {
      const m1 = ModuleBuilder.empty()
        .define('key1', () => 123)
        .build();

      const m2 = ModuleBuilder.empty()
        .import('imported', m1)
        .define('key2', () => 'string')
        .define('key1', () => 123)
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
        .define('key1', () => 123)
        .define('key2', () => 'someString')
        .build();

      const root = ModuleBuilder.empty()
        .import('imported', child1)
        .define('cls', ({ imported }) => new TestClassArgs2(imported.key1, imported.key2))
        .build();

      const mPatch = child1.replace('key2', () => 'replacedString');

      const c = container({
        overrides: [mPatch],
      });

      const classInstance = c.get(root, 'cls');
      expect(classInstance.someString).toEqual('replacedString');
    });

    it(`replaces all imports of given module`, async () => {
      const root = ModuleBuilder.empty()
        .import('import1', () => child1)
        .import('import2', () => child1)
        .define('cls', ({ import1, import2 }) => new TestClassArgs2(import1.key1, import2.key2))
        .build();

      const child1 = ModuleBuilder.empty()
        .define('key1', () => 123)
        .define('key2', () => 'someString')
        .build();

      const c = container({
        overrides: [
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
      const m1 = module().define('a', () => 'string');
      const m2 = m1.define('b', () => 'someOtherString').build();
      expect(m1.isEqual(m2)).toEqual(false);
    });

    it(`returns true for module with replaced value`, async () => {
      const m1 = module()
        .define('a', () => 'string')
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
          .define('someString', () => 'string')
          .build();

        // @ts-expect-error - value(1) is not compatible with string
        emptyModule.replace('someString', () => 1);
      });
    });
  });

  describe(`decorate`, () => {
    it(`decorates original value`, async () => {
      const m = module()
        .define('someValue', () => 1)
        .build();

      const mPatch = m.decorate('someValue', val => val + 1);

      const c = container({ overrides: [mPatch] });
      expect(c.get(m, 'someValue')).toEqual(2);
    });

    it(`does not affect original module`, async () => {
      const m = module()
        .define('someValue', () => 1)
        .build();
      const mPatch = m.decorate('someValue', val => val + 1);

      expect(container().get(m, 'someValue')).toEqual(1);
      expect(container({ overrides: [mPatch] }).get(m, 'someValue')).toEqual(2);
    });

    it(`allows for multiple decorations`, async () => {
      const m = module()
        .define('someValue', () => 1)
        .build();

      const mPatch = m.decorate('someValue', val => val + 1).decorate('someValue', val => val * 3);

      const c = container({ overrides: [mPatch] });
      expect(c.get(m, 'someValue')).toEqual(6);
    });

    it(`works allows to using other dependencies`, async () => {
      const m = module()
        .define('a', () => 1)
        .define('b', () => 2)
        .define('someValue', () => 10)
        .build();

      const mPatch = m.decorate('someValue', (val, { a, b }) => val + a + b);

      const c = container({ overrides: [mPatch] });
      expect(c.get(m, 'someValue')).toEqual(13);
    });

    it(`works allows to using other dependencies`, async () => {
      const m = module()
        .define('a', () => 1)
        .define('b', () => 2)
        .define('someValue', ({ a, b }) => a + b)
        .build();

      const mPatch = m.decorate('someValue', (val, { b }) => val * b);

      const c = container({ overrides: [mPatch] });
      expect(c.get(m, 'someValue')).toEqual(6);
    });

    describe(`scopes`, () => {
      it(`preserves singleton scope of the original resolver`, async () => {
        const m = module()
          .define('a', () => Math.random())
          .build();

        const mPatch = m.decorate('a', a => a);

        const c = container({ overrides: [mPatch] });
        expect(c.get(m, 'a')).toEqual(c.get(m, 'a'));
      });

      it(`preserves transient scope of the original resolver`, async () => {
        const m = module()
          .define('a', () => Math.random(), transient)
          .build();

        const mPatch = m.decorate('a', a => a);

        const c = container({ overrides: [mPatch] });
        expect(c.get(m, 'a')).not.toEqual(c.get(m, 'a'));
      });

      it(`uses different request scope for each subsequent asObject call`, async () => {
        const m = module()
          .define('source', () => Math.random(), request)
          .define('a', ({ source }) => source, request)
          .build();

        const mPatch = m.decorate('a', a => a);

        const c = container({ overrides: [mPatch] });
        const req1 = c.asObject(m);
        const req2 = c.asObject(m);

        expect(req1.source).toEqual(req1.a);
        expect(req2.source).toEqual(req2.a);
        expect(req1.source).not.toEqual(req2.source);
        expect(req1.a).not.toEqual(req2.a);
      });

      it(`does not cache produced object`, async () => {
        const m = module()
          .define('a', () => Math.random(), request)
          .define('b', () => Math.random(), request)
          .build();

        const c = container();
        const obj1 = c.asObject(m);
        const obj2 = c.asObject(m);

        expect(obj1).not.toBe(obj2);
      });
    });

    describe(`overrides`, () => {
      it(`acts like replace in terms of module identity`, async () => {
        const m = module()
          .define('a', () => 1)
          .build();

        const c = container({ overrides: [m.decorate('a', a => a + 1)] });

        expect(c.get(m, 'a')).toEqual(2);
      });
    });
  });

  describe(`freezing`, () => {
    it(`throws if one tries to extend module which is already frozen`, async () => {
      const prevModule = module();
      const def1 = prevModule.define('a', () => 1).build();
      expect(() => prevModule.define('b', () => 2)).toThrow();
    });

    it(`throws if one tries to freeze a parent module while child module is frozen`, async () => {
      const prefModule = module();
      const nextModule = prefModule.define('a', () => 1).build();
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
        .define('a', obj => {
          objCalls.push(obj);
          return 1;
        })
        .define('b', obj => {
          objCalls.push(obj);
          return 2;
        })
        .define('c', obj => {
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
